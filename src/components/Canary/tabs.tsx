import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { HealthCheck } from "../../types/healthChecks";

const defaultTabs = {
  all: {
    key: "all",
    value: "all",
    label: "All"
  }
};

// filter checks according to the 'tabBy' and selected tab
export function filterChecksByTabSelection(
  tabBy: string,
  selectedTab: string,
  checks: HealthCheck[]
) {
  if (
    checks == null ||
    (checks &&
      Object.keys(checks).length === 0 &&
      Object.getPrototypeOf(checks) === Object.prototype)
  ) {
    return checks;
  }
  let filteredChecks = checks;
  if (selectedTab !== "all") {
    if (tabBy === "namespace") {
      // if filter by namespace, show only selected namespace
      filteredChecks = checks.filter((o) => o.namespace === selectedTab);
    } else {
      // filtered by non-boolean labels
      filteredChecks = checks.filter(
        (o) =>
          Object.prototype.hasOwnProperty.call(o.labels, tabBy) &&
          o.labels[tabBy] === selectedTab
      );
    }
  }
  return filteredChecks;
}

export function generateTabs(tabBy: string, checks: HealthCheck[]) {
  if (checks == null) {
    return defaultTabs;
  }
  let tabs = defaultTabs;
  if (tabBy === "namespace") {
    const namespaces = [...new Set(checks.map((o) => o.namespace))];
    tabs = {
      ...tabs,
      ...namespaces.reduce(
        (acc, namespace) => ({
          ...acc,
          [namespace]: {
            key: namespace,
            value: namespace,
            label: namespace
          }
        }),
        {}
      )
    };
  } else {
    // generate tabs by non boolean label
    const label = tabBy;
    const matchingLabelValues = checks.reduce((acc, o) => {
      if (o.labels == null) {
        return acc;
      }
      const labelKeys = Object.keys(o.labels);
      if (labelKeys.length > 0 && labelKeys.includes(label)) {
        acc = { ...acc, [o.labels[label]]: null };
      }
      return acc;
    }, {});
    tabs = {
      ...tabs,
      ...Object.keys(matchingLabelValues).reduce(
        (acc, labelValue) => ({
          ...acc,
          [labelValue]: {
            key: labelValue,
            value: labelValue,
            label: labelValue
          }
        }),
        {}
      )
    };
  }
  return tabs;
}

type CanaryTabsProps = {
  checks: HealthCheck[];
  tabBy: string;
  setTabSelection: (tab: string) => void;
};

export function CanaryTabs({
  checks,
  tabBy,
  setTabSelection,
  ...rest
}: CanaryTabsProps) {
  const [tabs, setTabs] = useState(generateTabs(tabBy, checks));
  const [selectedTab, setSelectedTab] = useState(Object.values(tabs)[0].value);

  // changes in checks and tabBy(dropdown) will generate new tabs
  useEffect(() => {
    setTabs(generateTabs(tabBy, checks));
  }, [checks, tabBy]);

  // checking if previously selected tab still exists in newly-generated tabs
  useEffect(() => {
    // if it doesnt exist, reset to the first tab value
    if (!Object.prototype.hasOwnProperty.call(tabs, selectedTab)) {
      setSelectedTab(Object.values(tabs)[0].value);
    }
  }, [tabs, selectedTab]);

  // changes in selected tab will trigger setTabSelection callback
  useEffect(() => {
    setTabSelection(selectedTab);
  }, [selectedTab, setTabSelection]);

  return (
    <Tabs
      {...rest}
      tabs={Object.values(tabs)}
      value={selectedTab}
      onClick={(tab) => setSelectedTab(tab.value)}
    />
  );
}

type TabsProps = {
  tabs: { value: string; label: string }[];
  value: string;
  onClick: (tab: { value: string; label: string }) => void;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">;

export function Tabs({ tabs, value, onClick, className, ...rest }: TabsProps) {
  return (
    <div
      className={`flex flex-wrap border-b border-gray-300 ${className}`}
      aria-label="Tabs"
      {...rest}
    >
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.value}
          onClick={() => onClick(tab)}
          style={{
            marginBottom: "-1px",
            borderColor: tab.value === value ? "" : "transparent",
            borderBottomColor: tab.value === value ? "white" : ""
          }}
          className={clsx(
            tab.value === value ? "text-gray-900 bg-white" : "text-gray-500",
            "px-4 py-2 font-medium text-sm rounded-t-md border border-gray-300 hover:text-gray-900"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
