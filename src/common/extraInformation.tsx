import { Info } from "lucide-react";

export function ExtraInformation({
  extraInformation,
  tooltipOpen,
  setTooltipOpen,
  uploadCentreTable,
}: {
  extraInformation: string;
  tooltipOpen: boolean;
  setTooltipOpen: (open: boolean) => void;
  uploadCentreTable?: boolean;
}) {
  return (
    <div className="relative">
      <Info
        className="w-5 h-5 text-sidebar-foreground cursor-pointer"
        onMouseEnter={() => setTooltipOpen(true)}
        onMouseLeave={() => setTooltipOpen(false)}
      />
      {tooltipOpen && (
        <div
          className={`absolute z-10 p-2 w-[200px] sm:w-[300px] bg-gray-800 text-white text-xs rounded-md  top-0  ${
            uploadCentreTable ? "left-6" : "right-6"
          } transform`}
        >
          <p>{extraInformation}</p>
        </div>
      )}
    </div>
  );
}
