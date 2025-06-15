'use client'
import { useWebinarStore } from '@/store/useWebinarStore';
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircleIcon, Check, ChevronRightSquareIcon, Loader2Icon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createWebinar } from '@/actions/webinar';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { addVapiCallId, createCall } from '@/actions/call';
import { useCallStore } from '@/store/useCallStore';

type Steps = {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}


type Props = {
  steps: Steps[];
  onComplete: (id: string) => void;
}

const MultiStepForm = (props: Props) => {
  const { formData, validateStep, isSubmitting, setSubmitting, setModalOpen } = useCallStore();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string | null>(null);

  const currentStep = props.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === props.steps.length - 1;

  const router = useRouter()

  const handleBack = () => {
    if (isFirstStep) {
      setModalOpen(false);
    } else {
      setCurrentStepIndex(currentStepIndex - 1);
      setValidationErrors(null);
    }
  }



  const handleNext = async () => {
    setValidationErrors(null);
    const isValid = await validateStep(currentStep.id as keyof typeof formData);
    if (!isValid) {
      
      setValidationErrors('Please fill in all required fields.');
      return;
    }
    if (!completedSteps.includes(currentStep.id)) {
      setCompletedSteps([...completedSteps, currentStep.id]);
    }

    if (isLastStep) {
      try {
        setSubmitting(true);
        const reasult = await createCall(formData);



        if (reasult?.status === 200 && reasult.callId) {
          toast.success('Calls Created Successfully');
          
          props.onComplete(reasult.callId);

        } else {
          toast.error('Something went wrong');
          setValidationErrors(reasult?.message || 'Something went wrong');
        }
        router.refresh();

      } catch (error) {
        console.log(error);
        toast.success('Something went wrong');
        setValidationErrors( 'Something went wrong');
      } finally {
        setSubmitting(false);
      }
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }


  }

  return (
    <div className='flex flex-col justify-center items-center bg-[#27272A]/20 border border-border rounded-2xl overflow-hidden  max-w-6xl mx-auto backdrop-blur-[106px] '>
      <div className="flex items-center justify-start w-full">
        <div className="w-full md:w-1/3 p-6 ">
          <div className="space-y-6">
            {props.steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrentStep = index === currentStepIndex;
              const isPast = index === props.steps.length - 1;


              return (
                <div className="relative" key={step.id} >
                  <div className="flex items-start gap-4 ">
                    <div className="relative">
                      <motion.div initial={false}
                        animate={{
                          backgroundColor: isCompleted || isCurrentStep
                            ? 'rgb(147,51,234)' : '(rgb(31,41,55))',
                          scale: [isCompleted || !isCurrentStep ? 0.8 : 1, 1],
                          transition: { duration: 0.3 },
                        }}
                        className='flex items-center justify-center w-8 h-8 rounded-full z-10'
                      >
                        <AnimatePresence mode='wait' >
                          {isCompleted ? (
                            <motion.div
                              key="check"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Check className='w-5 h-5 text-white ' />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="number"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              transition={{ duration: 0.2 }}
                              className='text-white'
                            >
                              <Check className='w-5 h-5 text-white/50 ' />
                            </motion.div>
                          )}

                        </AnimatePresence>
                      </motion.div>

                      {index < props.steps.length - 1 && (
                        <div className="absolute top-8 left-4 w-0.5 h-16 bg-gray-700 overflow-hidden">
                          <motion.div
                            initial={{
                              height: isPast || isCompleted ? '100%' : '0%',
                            }}
                            animate={{
                              height: isPast || isCompleted ? '100%' : '0%',
                              backgroundColor: 'rgb(147,51,234)',
                            }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            className='w-full h-full'
                          />
                        </div>
                      )}

                    </div>

                    <div className="pt-1  ">
                      <motion.h3
                        animate={{
                          color: isCompleted || isCurrentStep
                            ? 'rgb(255,255,255)' : 'rgb(156,163,157)',
                          transition: { duration: 0.3 },
                        }}
                        className='font-medium'
                      >
                        {step.title}
                      </motion.h3>
                      <p className='text-sm text-gray-500'>
                        {step.description}

                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        <Separator
          orientation='vertical'
          className='data-[orientation=vertical]:h-1/2'
        />

        <div className="w-full md:w-2/3">
          <AnimatePresence mode='wait' >
            <motion.div
              key={currentStep.id}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className='p-6 max-w-full'
            >
              <div className="mb-6 w-full">
                <h2 className='text-xl font-semibold '>
                  {currentStep.title}
                </h2>
                <p className='text-gray-400 w-full'>
                  {currentStep.description}
                </p>
              </div>

              {/* Render The current step components */}
              {currentStep.component}
              {/* validation and Errors */}

              {validationErrors && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-md flex items-start gap-2 text-red-300">
                  <AlertCircleIcon className='w-5 h-5 mt-0.5 flex-shrink-0' />
                  <p>{validationErrors}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full p-6 flex justify-between">
        <Button
          variant='outline'
          onClick={handleBack}
          className={cn('border-gray-700 text-white hover:bg-gray-800 ', isFirstStep && 'opacity-50 cursor-not-allowed')}
          disabled={isSubmitting}

        >
          {isFirstStep ? 'Cansle' : 'Back'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={isSubmitting}

        >
          {
            isLastStep ? (
              isSubmitting ? (
                <>
                  <Loader2Icon className='w-5 h-5 animate-spin' />
                  Creating...
                </>
              ) : (
                'Complete'
              )
            ) : (
              'Next'
            )
          }
          {!isLastStep && <ChevronRightSquareIcon className='w-5 h-5' />}
        </Button>
      </div>

    </div>
  )
}

export default MultiStepForm