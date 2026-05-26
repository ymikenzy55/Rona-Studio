import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { bookingsApi, bookingConfigApi } from '@/services/api';
import { modalBackdrop, modalContent } from '@/animations/variants';
import { lockScroll, unlockScroll } from '@/utils/helpers';
import type { BookingFormData, ServiceType, PackageType } from '@/types';

export const BookingModal = () => {
  const { data: bookingConfig } = useQuery({
    queryKey: ['booking-config'],
    queryFn: async () => {
      const res = await bookingConfigApi.getConfig();
      return res.data.data;
    },
  });

  const services = bookingConfig?.services || [];
  const packages = bookingConfig?.packages || [];
  const customQuestions: any[] = bookingConfig?.questions || [];
  const allowCustomService = bookingConfig?.allowCustomService !== false;
  const allowCustomPackage = bookingConfig?.allowCustomPackage !== false;

  const hasCustomQuestions = customQuestions.length > 0;
  const steps = hasCustomQuestions
    ? ['Service', 'Date & Package', 'Your Details', 'Questions', 'Confirm']
    : ['Service', 'Date & Package', 'Your Details', 'Confirm'];
  const confirmStep = steps.length - 1;
  const { isBookingModalOpen, setIsBookingModalOpen } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [showCustomService, setShowCustomService] = useState(false);
  const [showCustomPackage, setShowCustomPackage] = useState(false);
  const [customServiceValue, setCustomServiceValue] = useState('');
  const [customPackageValue, setCustomPackageValue] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    getValues,
    setValue,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>();

  const selectedService = watch('service');
  const selectedPackage = watch('package');

  useEffect(() => {
    if (isBookingModalOpen) {
      lockScroll();
    } else {
      unlockScroll();
      setTimeout(() => {
        setCurrentStep(0);
        setIsSuccess(false);
        reset();
      }, 300);
    }

    return () => unlockScroll();
  }, [isBookingModalOpen, reset]);

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const values = getValues();
      const answersPayload = customQuestions.map((q: any) => ({
        questionId: q.id,
        question: q.label,
        answer: customAnswers[q.id] || '',
      }));
      await bookingsApi.create({ ...values, customAnswers: answersPayload } as any);
      setIsSuccess(true);
    } catch (error: any) {
      if (error?.message?.includes('Network Error') || error?.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your internet connection and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit booking. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepFields: Record<number, (keyof BookingFormData)[]> = {
    0: ['service'],
    1: ['preferredDate', 'package'],
    2: ['fullName', 'email', 'phone'],
  };

  const handleNext = async () => {
    const fields = stepFields[currentStep];
    if (fields) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isBookingModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={modalBackdrop}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] overflow-y-auto"
        data-lenis-prevent
        onClick={() => setIsBookingModalOpen(false)}
      >
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            variants={modalContent}
            className="bg-white rounded-3xl max-w-2xl w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
          {isSuccess ? (
            // Success State
            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5"
                >
                  <Check size={40} className="text-green-600" />
                </motion.div>
                <h3 className="text-2xl font-display font-bold text-primary-dark mb-2">Booking Request Received!</h3>
                <p className="text-gray-500 text-sm">
                  Thank you! We've received your request and will get back to you within 24 hours.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 space-y-3 mb-8 text-sm">
                <p className="font-bold text-primary-dark mb-3">Your Booking Summary</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-500">Service</p>
                    <p className="font-semibold text-primary-dark">{services.find((s: any) => s.value === watch('service'))?.label || watch('service') || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Package</p>
                    <p className="font-semibold text-primary-dark">{packages.find((p: any) => p.value === watch('package'))?.label || watch('package') || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Preferred Date</p>
                    <p className="font-semibold text-primary-dark">{watch('preferredDate') || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-semibold text-primary-dark">{watch('fullName') || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Email</p>
                    <p className="font-semibold text-primary-dark break-all">{watch('email') || '—'}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="w-full py-3 bg-primary-yellow text-primary-dark font-bold rounded-2xl hover:bg-yellow-500 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-8 border-b border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="heading-md">Book an Appointment</h2>
                  <button
                    onClick={() => setIsBookingModalOpen(false)}
                    className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center 
                               justify-center transition-colors duration-300"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center 
                                     font-semibold transition-all duration-300 ${
                            index <= currentStep
                              ? 'bg-primary-yellow text-primary-dark'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="text-xs mt-2 text-gray-600 hidden sm:block">
                          {step}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`h-1 flex-1 transition-all duration-300 ${
                            index < currentStep ? 'bg-primary-yellow' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="p-8">
                {/* Step 1: Service Selection */}
                {currentStep === 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-xl font-display font-semibold mb-6">
                      Select a Service
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {services.map((service: any) => (
                        <label
                          key={service.value}
                          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            selectedService === service.value
                              ? 'border-primary-yellow bg-primary-yellow/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            value={service.value}
                            {...register('service', { required: true })}
                            onChange={() => setShowCustomService(false)}
                            className="sr-only"
                          />
                          <span className="font-semibold text-primary-dark">
                            {service.label}
                          </span>
                        </label>
                      ))}
                      {allowCustomService && (
                        <label
                          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            showCustomService
                              ? 'border-primary-yellow bg-primary-yellow/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            value="custom"
                            {...register('service', { required: true })}
                            onChange={() => setShowCustomService(true)}
                            className="sr-only"
                          />
                          <span className="font-semibold text-primary-dark">
                            Other (Specify)
                          </span>
                        </label>
                      )}
                    </div>
                    {showCustomService && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4"
                      >
                        <input
                          type="text"
                          value={customServiceValue}
                          onChange={(e) => {
                            setCustomServiceValue(e.target.value);
                            setValue('service', e.target.value);
                          }}
                          placeholder="Please specify your service"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                   focus:border-primary-yellow focus:outline-none transition-colors"
                        />
                      </motion.div>
                    )}
                    {errors.service && (
                      <p className="text-red-500 text-sm mt-2">Please select a service</p>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Date & Package */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        {...register('preferredDate', { required: true })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                   focus:border-primary-yellow focus:outline-none transition-colors"
                      />
                      {errors.preferredDate && (
                        <p className="text-red-500 text-sm mt-1">Please select a date</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Package
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {packages.map((pkg: any) => (
                          <label
                            key={pkg.value}
                            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                              selectedPackage === pkg.value
                                ? 'border-primary-yellow bg-primary-yellow/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              value={pkg.value}
                              {...register('package', { required: true })}
                              onChange={() => setShowCustomPackage(false)}
                              className="sr-only"
                            />
                            <div className="font-semibold text-primary-dark mb-1">
                              {pkg.label}
                            </div>
                            <div className="text-sm text-gray-600">{pkg.description}</div>
                          </label>
                        ))}
                        {allowCustomPackage && (
                          <label
                            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                              showCustomPackage
                                ? 'border-primary-yellow bg-primary-yellow/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              value="custom"
                              {...register('package', { required: true })}
                              onChange={() => setShowCustomPackage(true)}
                              className="sr-only"
                            />
                            <div className="font-semibold text-primary-dark mb-1">
                              Other
                            </div>
                            <div className="text-sm text-gray-600">Specify your needs</div>
                          </label>
                        )}
                      </div>
                      {showCustomPackage && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4"
                        >
                          <input
                            type="text"
                            value={customPackageValue}
                            onChange={(e) => {
                              setCustomPackageValue(e.target.value);
                              setValue('package', e.target.value);
                            }}
                            placeholder="Please specify your package needs"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                     focus:border-primary-yellow focus:outline-none transition-colors"
                          />
                        </motion.div>
                      )}
                      {errors.package && (
                        <p className="text-red-500 text-sm mt-2">Please select a package</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Personal Details */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        {...register('fullName', { required: true })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                   focus:border-primary-yellow focus:outline-none transition-colors"
                        placeholder="John Doe"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">Name is required</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                   focus:border-primary-yellow focus:outline-none transition-colors"
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">Valid email is required</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        {...register('phone', {
                          required: 'Phone number is required',
                          pattern: {
                            value: /^[+]?[\d\s\-()]{10,}$/,
                            message: 'Enter a valid phone number (min 10 digits, numbers only)',
                          },
                          validate: (v) =>
                            (v.replace(/\D/g, '').length >= 10) || 'Phone must have at least 10 digits',
                        })}
                        onKeyDown={(e) => {
                          if (!/[\d\s\+\-\(\)\b]/.test(e.key) && !['Backspace','Delete','ArrowLeft','ArrowRight','Tab'].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                   focus:border-primary-yellow focus:outline-none transition-colors"
                        placeholder="0201234567"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message as string}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Message
                      </label>
                      <textarea
                        {...register('message')}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                                   focus:border-primary-yellow focus:outline-none transition-colors resize-none"
                        placeholder="Tell us more about your event..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step: Custom Questions (step index 3 when hasCustomQuestions) */}
                {hasCustomQuestions && currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-display font-semibold mb-2">A Few More Details</h3>
                    <p className="text-sm text-gray-500 mb-4">Please answer the following questions to help us serve you better.</p>
                    {customQuestions.map((q: any) => (
                      <div key={q.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {q.label}{q.required && ' *'}
                        </label>
                        {q.type === 'textarea' ? (
                          <textarea
                            rows={3}
                            required={q.required}
                            value={customAnswers[q.id] || ''}
                            onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-yellow focus:outline-none transition-colors resize-none"
                          />
                        ) : q.type === 'select' ? (
                          <select
                            required={q.required}
                            value={customAnswers[q.id] || ''}
                            onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-yellow focus:outline-none transition-colors"
                          >
                            <option value="">Select an option</option>
                            {(q.options || []).map((opt: string) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : q.type === 'radio' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(q.options || []).map((opt: string) => (
                              <label
                                key={opt}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                  customAnswers[q.id] === opt
                                    ? 'border-primary-yellow bg-primary-yellow/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={opt}
                                  checked={customAnswers[q.id] === opt}
                                  onChange={() => setCustomAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                                  className="sr-only"
                                />
                                <span className="font-semibold text-primary-dark text-sm">{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <input
                            type="text"
                            required={q.required}
                            value={customAnswers[q.id] || ''}
                            onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-yellow focus:outline-none transition-colors"
                          />
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Step: Confirmation (last step) */}
                {currentStep === confirmStep && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-display font-semibold mb-6">
                      Review Your Booking
                    </h3>
                    <div className="bg-primary-gray rounded-xl p-6 space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Service</p>
                        <p className="font-semibold text-primary-dark">
                          {services.find((s: any) => s.value === selectedService)?.label || selectedService}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Package</p>
                        <p className="font-semibold text-primary-dark">
                          {packages.find((p: any) => p.value === selectedPackage)?.label || selectedPackage}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-semibold text-primary-dark">
                          {watch('preferredDate')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Contact</p>
                        <p className="font-semibold text-primary-dark">{watch('fullName')}</p>
                        <p className="text-sm text-gray-600">{watch('email')}</p>
                        <p className="text-sm text-gray-600">{watch('phone')}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-8">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 px-6 py-3 rounded-full border-2 border-gray-300 
                                 font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                  )}
                  {currentStep < confirmStep ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 btn-primary"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={onSubmit}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Booking'}
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
