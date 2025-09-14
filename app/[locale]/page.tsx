import { ReadingSelection } from "@/components/reading-selection";
import { DateNavigation } from "@/components/date-navigation";
import { SettingsDialog } from "@/components/settings-dialog";
import { Onboarding } from "@/components/onboarding";

export default function Page() {
  return (
    <>
      <Onboarding />
      <ReadingSelection />
      <DateNavigation />
      <SettingsDialog />
    </>
  );
}
