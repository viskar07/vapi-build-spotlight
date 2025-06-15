import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCallStore } from "@/store/useCallStore";
import { Assistant } from "@vapi-ai/server-sdk/api";
import { Search } from "lucide-react";

type Props = {
    assistants: Assistant[] | [];
  };
const CallInfoStep = (props:Props) => {
  const { formData, updateInfoField, getValidationStateErrors } =
    useCallStore();

  const errors = getValidationStateErrors("info");


  const { agenda, description, aiAgent } =
    formData.info;


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updateInfoField(name as keyof typeof formData.info, value);
  };

  const handleSelectAiAgents = (value: string) => {
    updateInfoField("aiAgent", value);
  }








  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label
          htmlFor="agenda"
          className={errors.webinar ? "text-red-400" : ""}
        >
          Agenda <span className="text-red-400">*</span>
        </Label>
        <Input
          id="Agenda"
          name="agenda"
          value={agenda || ""}
          onChange={handleChange}
          placeholder="Agenda"
          className={cn(
            "!bg-background/50 border border-input",
            errors.agenda && "border-red-400 focus-visible:ring-red-400"
          )}
        />
        {errors.webinarName && (
          <p className="text-red-400 text-sm">{errors.agenda}</p>
        )}
      </div>


      <div className="space-y-2">
        <Label
          htmlFor="description"
          className={errors.description ? "text-red-400" : ""}
        >
          Description <span className="text-red-400">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          value={description || ""}
          onChange={handleChange}
          placeholder="Description"
          className={cn(
            "min-h-[100px] !bg-background/50 border border-input",
            errors.description && "border-red-400 focus-visible:ring-red-400"
          )}
        />
        {errors.description && (
          <p className="text-red-400 text-sm">{errors.description}</p>
        )}
      </div>

      <div className="space-y-2">
          <Label>Attach an AI Agents</Label>
          <div className="relative">
            <div className="mb-2">
              <div className="relative">
                <Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-500' />
                <Input
                  placeholder="Search agents"
                  className='pl-9 !background/50 border border-input'
                />
              </div>
            </div>
            <Select
              value={aiAgent}
              onValueChange={handleSelectAiAgents}
            >
              <SelectTrigger className='w-full !bg-background/50 border border-input '>
                <SelectValue placeholder="Select an Agents " />
              </SelectTrigger>
              <SelectContent className='bg-background border border-input max-h-48 '>
                {
                  props.assistants.length > 0 ? (
                    props.assistants?.map((assistant) => (
                      <SelectItem
                        key={assistant.id}
                        value={assistant.id}
                        className='!bg-background/50 :hover:!bg-background/10'
                      >
                        {assistant?.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem
                      value="No Agent Available"
                      disabled
                    >
                      No Agents Available
                    </SelectItem>

                  )
                }

              </SelectContent>
            </Select>
          </div>


        </div>

     

 
    </div>
  );
};

export default CallInfoStep;
