import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { uploadFiles } from "@/lib/uploadthing/client";
import { cn } from "@/lib/utils";
import { useWebinarStore } from "@/store/useWebinarStore";
import { format } from "date-fns";
import { Calendar1, Check, Clock, Loader2, Upload } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";


const BasicInfoStep = () => {
  const { formData, updateBasicInfoFields, getValidationStateErrors } =
    useWebinarStore();
  const errors = getValidationStateErrors("basicInfo");
  const { webinarName, description, date, time, timeFormat, thumbnail, } =
    formData.basicInfo;

  const [uploading, setUploading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updateBasicInfoFields(name as keyof typeof formData.basicInfo, value);
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    updateBasicInfoFields("date", selectedDate);

    if (selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        toast.error("Date must be in the future");
      }
    }
  };

  const handleTimeFormatChange = (value: "AM" | "PM") => {
    updateBasicInfoFields("timeFormat", value);
  };


  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log(file);
    
    if (!file) return;


    setUploading(true);

    try {
      const [res] = await uploadFiles('imageUploader', { files: [file] });
      console.log(res);
      if (res?.ufsUrl) updateBasicInfoFields("thumbnail", res.ufsUrl);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label
          htmlFor="WebinarName"
          className={errors.webinar ? "text-red-400" : ""}
        >
          Webinar Name <span className="text-red-400">*</span>
        </Label>
        <Input
          id="webinarName"
          name="webinarName"
          value={webinarName || ""}
          onChange={handleChange}
          placeholder="Webinar Name"
          className={cn(
            "!bg-background/50 border border-input",
            errors.webinarName && "border-red-400 focus-visible:ring-red-400"
          )}
        />
        {errors.webinarName && (
          <p className="text-red-400 text-sm">{errors.webinarName}</p>
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
          placeholder="Webinar Description"
          className={cn(
            "min-h-[100px] !bg-background/50 border border-input",
            errors.webinarName && "border-red-400 focus-visible:ring-red-400"
          )}
        />
        {errors.webinarName && (
          <p className="text-red-400 text-sm">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Calender */}
        <div className="space-y-2">
          <Label
            htmlFor="description"
            className={errors.date ? "text-red-400" : ""}
          >
            Webinar Date <span className="text-red-400">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal !bg-background/50 border border-input",
                  errors.date && "border-red-400 focus-visible:ring-red-400",
                  !date && "text-gray-500"
                )}
              >
                <Calendar1 className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 !bg-background/50 border border-input">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus={true}
                className="!bg-background/50 "
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="text-red-400 text-sm">{errors.date}</p>}
        </div>

        <div className="space-y-2">
          <Label className={errors.time ? "text-red-400 " : ""}>
            Webinar Time <span className="text-red-400">*</span>
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-foreground" />
              <Input
                type="time"
                name="time"
                value={time || ""}
                onChange={handleChange}
                placeholder="12:00"
                className={cn(
                  " pl-9 !bg-background/50 border border-input",
                  errors.time && "border-red-400 focus-visible:ring-red-400"
                )}
              />
            </div>
            <Select
              value={timeFormat || "AM"}
              onValueChange={handleTimeFormatChange}
            >
              <SelectTrigger className="w-20 !bg-background/50 border-input">
                <SelectValue placeholder="AM" />
              </SelectTrigger>
              <SelectContent className="w-20!bg-background/50 border-input">
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.time && <p className="text-red-400 text-sm">{errors.time}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
  <div className="flex items-center">
    <Upload className="h-4 w-4 mr-2" />
    Upload a thumbnail for the webinar.
  </div>

  <div className="relative ml-auto">
    <Button
      variant="outline"
      className="border border-input hover:bg-background"
      disabled={uploading}
    >
      {uploading ? (
        <>
        <Loader2 className="h-4 w-4 mr-2 animate-spin text-muted-foreground" />
        Uploading...
        </>
      ) : thumbnail? (
        <>
        <Check className="h-4 w-4 mr-2 text-accent-primary" />
        Uploaded
        </>
      ) :"Upload File"}
    </Button>
    <input
      type="file"
      accept="image/*"
      className="absolute inset-0 opacity-0 cursor-pointer"
      onChange={handleUpload}
    />
  </div>

 
</div>
    </div>
  );
};

export default BasicInfoStep;
