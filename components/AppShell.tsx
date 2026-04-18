"use client";

import { useState } from "react";
import type { ProposalData } from "@/lib/types";
import { ModeTabs } from "./ModeTabs";
import { StepIndicator } from "./StepIndicator";
import { ProposalForm } from "./ProposalForm";
import { ProductsTable } from "./ProductsTable";
import { ProposalPreview } from "./ProposalPreview";
import { BatchMode } from "./BatchMode";

const INITIAL_DATA: ProposalData = {
  type: "ips",
  institution: "",
  contactName: "",
  contactRole: "",
  contactEmail: "",
  city: "",
  discount: 10,
  paymentTermsKey: "30",
  ccEmails: [""],
};

export function AppShell() {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [data, setData] = useState<ProposalData>(INITIAL_DATA);

  const updateData = (patch: Partial<ProposalData>) =>
    setData((prev) => ({ ...prev, ...patch }));

  const updateCc = (emails: string[]) =>
    setData((prev) => ({ ...prev, ccEmails: emails }));

  return (
    <div>
      <ModeTabs mode={mode} onChange={setMode} />

      {mode === "single" ? (
        <div>
          <StepIndicator step={step} />
          {step === 1 && (
            <ProposalForm
              data={data}
              onChange={updateData}
              ccEmails={data.ccEmails}
              onCcChange={updateCc}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <ProductsTable
              data={data}
              onChange={updateData}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && <ProposalPreview data={data} onBack={() => setStep(2)} />}
        </div>
      ) : (
        <BatchMode />
      )}
    </div>
  );
}
