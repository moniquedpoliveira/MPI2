import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";
import { Box } from "./box";
import { Text } from "./text";

const Steps = ({
  currentStep,
  totalSteps,
}: { currentStep: number; totalSteps: number }) => {
  return (
    <Box
      className={cn(
        "grid gap-2 mt-1",
        "grid-cols-[repeat(var(--steps-count),minmax(0,1fr))]",
      )}
      // @ts-ignore
      style={{ "--steps-count": totalSteps } as CSSProperties}
    >
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <Step key={step} active={currentStep >= step} />
      ))}
    </Box>
  );
};

export const Step = ({ active }: { active: boolean }) => {
  return (
    <Box
      className={cn(
        "w-full h-1 rounded-full transition-colors duration-200",
        "bg-neutral-400",
        active && "bg-primary",
      )}
    />
  );
};

export const MultiStep = ({
  currentStep,
  totalSteps,
}: { currentStep: number; totalSteps: number }) => {
  return (
    <Box>
      <Text size="sm">
        Passo{" "}
        <Text size="xs" as="strong">
          {currentStep}
        </Text>{" "}
        de{" "}
        <Text size="xs" as="strong">
          {totalSteps}
        </Text>
      </Text>
      <Steps currentStep={currentStep} totalSteps={totalSteps} />
    </Box>
  );
};
