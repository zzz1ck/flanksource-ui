import { useCallback, useEffect } from "react";
import {
  useNavigate,
  useSearchParams,
  useOutletContext
} from "react-router-dom";
import { getAllConfigs } from "../../api/services/configs";
import { filterConfigsByText } from "../../components/ConfigViewer/utils";
import { BreadcrumbNav } from "../../components/BreadcrumbNav";
import ConfigList from "../../components/ConfigList";
import { useLoader } from "../../hooks";
import { useConfigPageContext } from "../../context/ConfigPageContext";
import ConfigsListFilters from "../../components/ConfigsListFilters";
import { RefreshButton } from "../../components/RefreshButton";

export function ConfigListPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const {
    configState: { data, filteredData },
    setConfigState
  } = useConfigPageContext();
  const { loading, setLoading } = useLoader();
  const { setTitle, setTitleExtras } = useOutletContext<any>();

  useEffect(() => {
    setTitleExtras(
      <RefreshButton onClick={() => getAllConfigs()} animate={loading} />
    );
  }, [loading, setTitleExtras]);

  const search = params.get("search");
  const tag = decodeURIComponent(params.get("tag") || "All");
  const configType = decodeURIComponent(params.get("type") || "All");

  const fetchAllConfigs = useCallback(() => {
    setLoading(true);
    getAllConfigs()
      .then((res) => {
        setConfigState((state) => {
          return {
            ...state,
            data: res.data ?? undefined
          };
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (params.get("query")) {
      return;
    }
    fetchAllConfigs();
  }, [params]);

  const handleRowClick = (row?: { original?: { id: string } }) => {
    const id = row?.original?.id;
    if (id) {
      navigate(`/configs/${id}`);
    }
  };

  useEffect(() => {
    let filteredData = data;
    setTitle(<BreadcrumbNav list={["Config"]} />);
    if (data?.length! > 0) {
      // do filtering here
      filteredData = filterConfigsByText(filteredData, search);

      if (configType && configType !== "All") {
        filteredData = filteredData!.filter(
          (d) => configType === d.config_type
        );
      }

      if (tag && tag !== "All") {
        filteredData = filteredData
          ?.filter((d) => d.tags)!
          .filter((d) => {
            if (!d.tags) {
              return false;
            }
            if (Array.isArray(decodeURI(tag))) {
              const kvs = (decodeURI(tag) as unknown as string[]).map((x) =>
                x.split("__:__")
              );
              return kvs.some(([key, val]) => d.tags?.[key] === val);
            } else {
              const [k, v] = decodeURI(tag).split("__:__");
              return !!Object.entries(d.tags).find(
                ([key, value]) => value === v && key === k
              );
            }
          });
      }
    }
    setConfigState((state) => {
      return {
        ...state,
        filteredData: filteredData
      };
    });
  }, [data, search, configType, tag]);

  return (
    <div className="flex flex-col h-full space-y-6 px-4 py-4">
      <div className="flex flex-row items-center">
        <ConfigsListFilters />
      </div>
      <ConfigList
        data={filteredData!}
        handleRowClick={handleRowClick}
        isLoading={loading}
      />
    </div>
  );
}
