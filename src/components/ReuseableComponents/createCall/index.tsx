'use client'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import React, { useState } from "react";
import MultiStepForm from "./MultiStepForm";
import { Assistant } from "@vapi-ai/server-sdk/api";
import { useCallStore } from "@/store/useCallStore";
import CredentialStep from "./CredentialStep";
import CallInfoStep from "./CallInfoStep";
import SuccessStep from "../CreateWebinarButton/SuccessStep";
import SelectAttendeeStep from "./SelectAttendeeStep";
import { AttendeeWithWebinarType, PhoneNumber } from "@/lib/type";

type Props = {
    assistants: Assistant[] | [];
    attendee: AttendeeWithWebinarType[] | []
    webinarKeys: {id:string,name:string}[] | [] 
    VapiCallCredential: PhoneNumber[] | []
};

const CreateCallButton = (props: Props) => {

    const steps = [
        {
          id: "vapiCredential",
          title: "Vapi Call Setup",
          description: "Provide your Vapi number and credentials to enable calling features.",
          component: (
            <CredentialStep 
              VapiCallCredential={props.VapiCallCredential}
            />
          ),
        },
        {
          id: "agendaSetup",
          title: "Agenda & Call Info",
          description: "Set the purpose, agenda, and how the call should be introduced to attendees.",
          component: (
            <CallInfoStep
              assistants={props.assistants}
            />
          ),
        },
        {
          id: "attendeeSelection",
          title: "Audience Selection",
          description: "Choose who you want to invite or target for this webinar call.",
          component: (
            <SelectAttendeeStep
              attendee={props.attendee}
              webinarKeys={props.webinarKeys}
            />
          ),
        },
      ];

    const {
        isModalOpen,
        setModalOpen,
        isCompleted,
        setComplete,
        resetForm
    } = useCallStore();

    const [callLink, setCallLink] = useState<string>("");

    const handleComplete = (callId: string) => {
        setComplete(true);
        setCallLink(
            `${process.env.NEXT_PUBLIC_BASE_URL}/calls/${callId}`
        );
    }
    const handleCreateNew = () => {
        resetForm();
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={setModalOpen} >
            <DialogTrigger asChild>
                <button className="rounded-xl flex gap-2 items-center hover:cursor-pointer px-4 py-2 border border-border bg-primary/10 backdrop-blur-sm text-sm font-normal text-primary hover:bg-primary-20 "
                    onClick={() => setModalOpen(true)}
                >
                    <PlusIcon />
                    Create Call
                </button>
            </DialogTrigger>

            <DialogContent className="w-full sm:min-w-fit p-0 bg-transparent border-none ">
                {isCompleted ? (
                    <div className="bg-muted text-primary rounded-lg overflow-hidden">
                        <DialogTitle className="sr-only">
                            It Take some time
                        </DialogTitle>
                        <SuccessStep
                            webinarLink={callLink}
                            onCreateNew={handleCreateNew}
                        />

                    </div>
                ) : (
                    <>
                        <DialogTitle className="sr-only">Create Call</DialogTitle>
                        <MultiStepForm steps={steps} onComplete={handleComplete} />

                    </>
                )}
            </DialogContent>
        </Dialog>
    )
};

export default CreateCallButton;
