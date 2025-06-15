import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useWebinarStore } from '@/store/useWebinarStore'
import { CtaTypeEnum } from '@prisma/client';
import { TabsTrigger } from '@radix-ui/react-tabs';
import { Assistant } from '@vapi-ai/server-sdk/api';
import { Search, XIcon } from 'lucide-react';
import React, { useState } from 'react'
import Stripe from 'stripe';


type Props = {
  stripeProducts: Stripe.Product[] | [];
  assistants: Assistant[] | [];
};

const CTAStep = (props: Props) => {
  const { formData, updateCtaFields, addTag, removeTag, getValidationStateErrors } = useWebinarStore();


  const { ctaLabel, tags, aiAgent, priceId, ctaType } = formData.cta;
  const errors = getValidationStateErrors("cta");


  const [tagInput, setTagInput] = useState("");


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateCtaFields(name as keyof typeof formData.cta, value);
  }
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
      setTagInput("");
    }
  }
  const handleSelectCTAType = (type: CtaTypeEnum) => {
    updateCtaFields("ctaType", type);
  }

  const handleProductChange = (value: string) => {
    updateCtaFields("priceId", value);
  }
  const handleSelectAiAgents = (value: string) => {
    updateCtaFields("aiAgent", value);
  }

  return (
    <div className='space-y-6'>
      <div className="space-y-2">
        <Label
          htmlFor="ctaLabel"
          className={errors.ctaLable ? "text-red-400" : ""}
        >
          CTA Label <span className="text-red-400">*</span>
        </Label>
        <Input
          id="ctaLabel"
          name="ctaLabel"
          value={ctaLabel || ""}
          onChange={handleChange}
          placeholder="Let's Get Started"
          className={cn(
            "!bg-background/50 border border-input",
            errors.webinarName && "border-red-400 focus-visible:ring-red-400"
          )}
        />
        {errors.ctaLable && (
          <p className="text-red-400 text-sm">{errors.ctaLable}</p>
        )}
      </div>
      <div className="space-y-2   ">
        <Label
          htmlFor="tags"
        >Tags</Label>
        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Add tags or press enter"
          className={cn(
            "!bg-background/50 border border-input",
          )}

        />
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag: string, index: number) => (
              <div key={index} className="flex items-center gap-1 bg-gray-800 text-white px-3 rounded-md">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-gray-400 hover:text-white"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 w-full ">
        <Label>CTA Type</Label>
        <Tabs
          defaultValue={CtaTypeEnum.BOOK_A_CALL}
          className='w-full'
        >
          <TabsList className='bg-transparent w-full '>
            <TabsTrigger
              value={CtaTypeEnum.BOOK_A_CALL}
              className='w-1/2 data-[state=active]:!bg-background/50 rounded-md p-1 data-[state=active]:!border border-border '
              onClick={() => handleSelectCTAType(CtaTypeEnum.BOOK_A_CALL)}
            >
              Book a Call
            </TabsTrigger>
            <TabsTrigger
              value={CtaTypeEnum.BUY_NOW}
              className='w-1/2  data-[state=active]:!bg-background/50 rounded-md p-1 data-[state=active]:!border border-border'
              onClick={() => handleSelectCTAType(CtaTypeEnum.BUY_NOW)}
            >
              Buy Now
            </TabsTrigger>

          </TabsList>
        </Tabs>
      </div>

      {ctaType === CtaTypeEnum.BOOK_A_CALL && (
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
      )}
        <div className="space-y-2 " >
        <Label>Attach an Products</Label>
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
            value={priceId}
            onValueChange={handleProductChange}
          >
            <SelectTrigger className='w-full !bg-background/50 border border-input '>
              <SelectValue placeholder="Select an Product " />
            </SelectTrigger>
            <SelectContent className='bg-background border border-input max-h-48 '>
              {
                props.stripeProducts.length > 0 ? (
                  props.stripeProducts?.map((product) => (
                    <SelectItem
                      key={product.id}
                      value={product?.default_price as string}
                      className='!bg-background/50 :hover:!bg-background/10'
                    >
                      {product?.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem
                    value="select"
                    disabled
                  >
                    Create a product in Stripe
                  </SelectItem>

                )
              }

            </SelectContent>
          </Select>
        </div>
      </div>


    </div>
  )
}

export default CTAStep