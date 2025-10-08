import { useState } from "react";
import Stepper from "../../components/common/Stepper";
import { Tabs } from "../../components/common/Tabs";
import Step0TypeChannel from "./Step0TypeChannel";
import Step1ComposeSMS from "./Step1ComposeSMS";
import Step1ComposeWhatsApp from "./Step1ComposeWhatsApp";
import Step1ComposeOTP from "./Step1ComposeOTP";
import Step2Preview from "./Step2Preview";
import Step3ScheduleConfirm from "./Step3ScheduleConfirm";
import { useCommsStore } from "../../store/useCommsStore";

const STEPS = ["Type & Channel", "Compose", "Preview", "Schedule / Confirm"];

export default function NewCommunication() {
  const [activeStep, setActiveStep] = useState(0);
  const wizard = useCommsStore((state) => state.wizard);

  const move = (next: number) => setActiveStep(next);

  return (
    <div className="space-y-6">
      <Stepper steps={STEPS} activeIndex={activeStep} />

      {activeStep === 0 ? (
        <Step0TypeChannel onNext={() => move(1)} />
      ) : null}

      {activeStep === 1 ? (
        <div className="space-y-4">
          {wizard.commType === "AUTHENTICATION_OTP" ? (
            <Step1ComposeOTP onNext={() => move(2)} />
          ) : (
            <ChannelComposeSection onNext={() => move(2)} />
          )}
        </div>
      ) : null}

      {activeStep === 2 ? (
        <Step2Preview onNext={() => move(3)} onBack={() => move(1)} />
      ) : null}

      {activeStep === 3 ? (
        <Step3ScheduleConfirm onBack={() => move(2)} />
      ) : null}
    </div>
  );
}

function ChannelComposeSection({ onNext }: { onNext: () => void }) {
  const wizard = useCommsStore((state) => state.wizard);
  const setChannel = useCommsStore((state) => state.setChannel);

  const activeChannel = wizard.channel === "WHATSAPP" ? "WHATSAPP" : "SMS";

  return (
    <div>
      <Tabs
        tabs={[
          { id: "SMS", label: "SMS", disabled: wizard.channel !== "SMS" },
          { id: "WHATSAPP", label: "WhatsApp", disabled: wizard.channel !== "WHATSAPP" }
        ]}
        activeId={activeChannel}
        onChange={(id) => {
          if (wizard.channel === id) return;
          setChannel(id as any);
        }}
      />
      {activeChannel === "SMS" ? <Step1ComposeSMS onNext={onNext} /> : null}
      {activeChannel === "WHATSAPP" ? <Step1ComposeWhatsApp onNext={onNext} /> : null}
    </div>
  );
}
