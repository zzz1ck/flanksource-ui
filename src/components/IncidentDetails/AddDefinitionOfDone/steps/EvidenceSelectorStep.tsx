import { ChangeEvent, useCallback, useMemo } from "react";
import { Evidence, EvidenceType } from "../../../../api/services/evidence";
import { EvidenceItem } from "../../../Hypothesis/EvidenceSection";
import MultiSelectList from "../../../MultiSelectList/MultiSelectList";

type Props = {
  noneDODEvidences: Evidence[];
  onSelectEvidence: (evidence: Evidence[]) => void;
  evidenceType: EvidenceType;
  selectedEvidences: Evidence[];
};

export default function EvidenceSelectorStep({
  onSelectEvidence,
  noneDODEvidences,
  selectedEvidences,
  evidenceType
}: Props) {
  const noneDODEvidencesFilteredByType = useMemo(
    () => noneDODEvidences.filter((evidence) => evidence.type === evidenceType),
    [noneDODEvidences, evidenceType]
  );

  const isAllSelected = useMemo(() => {
    return noneDODEvidencesFilteredByType.every((evidence) =>
      selectedEvidences.some(
        (selectedEvidence) => selectedEvidence.id === evidence.id
      )
    );
  }, [noneDODEvidencesFilteredByType, selectedEvidences]);

  const onSelectAllCheckboxChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        // Select all evidences of this type
        onSelectEvidence(noneDODEvidencesFilteredByType);
      } else {
        // Unselect all evidences of this type
        onSelectEvidence([]);
      }
    },
    [noneDODEvidencesFilteredByType, onSelectEvidence]
  );

  const onSelectSingleEvidenceCheckboxChange = useCallback(
    (selected: boolean, evidence: Evidence) => {
      const selectedEvidencesForType = selectedEvidences.filter(
        (evidence) => evidence.type === evidenceType
      );
      if (selected) {
        // Select evidence
        onSelectEvidence([...selectedEvidencesForType, evidence]);
      } else {
        // Unselect evidence
        onSelectEvidence(
          selectedEvidencesForType.filter((e) => e.id !== evidence.id)
        );
      }
    },
    [evidenceType, onSelectEvidence, selectedEvidences]
  );

  const isSelected = useCallback(
    (evidenceId: string) => {
      return selectedEvidences.some((evidence) => evidence.id === evidenceId);
    },
    [selectedEvidences]
  );

  if (noneDODEvidencesFilteredByType.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-col space-y-4 p-4 rounded-md border ${
        isAllSelected ? "border-blue-200" : "border-gray-300"
      }`}
    >
      <div className="flex flex-row space-x-4 items-center">
        <input
          onChange={onSelectAllCheckboxChange}
          id={`selectAll${evidenceType}`}
          type="checkbox"
          /* this might not work */
          checked={isAllSelected}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label
          htmlFor={`selectAll${evidenceType}`}
          className="capitalize font-semibold"
        >
          {evidenceType}
        </label>
      </div>
      <div className="flex flex-col space-y-2 ml-4">
        <MultiSelectList
          options={noneDODEvidencesFilteredByType}
          onOptionSelect={(evidence) => {
            onSelectSingleEvidenceCheckboxChange(
              !isSelected(evidence.id),
              evidence
            );
          }}
          selectedOptions={selectedEvidences}
          renderOption={(evidence, index) => {
            return (
              <div key={index} className="relative flex items-center">
                <div className="min-w-0 flex-1 text-sm mr-4">
                  {evidence.description && (
                    <div className="text-gray-500 py-2 text-base">
                      {evidence.description}
                    </div>
                  )}
                  <EvidenceItem evidence={evidence} />
                </div>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
