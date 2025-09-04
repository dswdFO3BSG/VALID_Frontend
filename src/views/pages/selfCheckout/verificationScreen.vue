<template>
    <div class="flex flex-col items-center justify-center h-screen w-screen mt-[10rem]">
        <Transition name="fade-up" appear>
            <div class="flex flex-col items-center">
                <h1 class="text-center text-[#2D318F] font-extrabold mb-10">SELF VERIFICATION KIOSK</h1>
            </div>
        </Transition>
        <div v-if="loading" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black bg-opacity-60 w-screen h-screen">
            <div class="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center">
                <svg class="animate-spin h-16 w-16 text-[#2D318F] mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <p class="text-2xl sm:text-lg text-[#2D318F] font-bold">Processing, please wait...</p>
            </div>
        </div>
        <div v-else-if="showSuccessScreen" class="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-8">
            <div class="flex flex-col items-center justify-center h-full w-full max-w-6xl">
                <!-- Success Icon -->
                <div class="mb-8">
                    <svg class="w-24 h-24 text-green-500" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <!-- Success Message -->
                <h1 class="text-6xl font-bold text-green-600 mb-4">TRANSACTION SUCCESSFUL!</h1>
                <p class="text-3xl text-gray-700 mb-8 text-center">Your application has been processed successfully</p>

                <!-- Receipt Style Queue Number -->
                <div class="bg-white border-4 border-dashed border-gray-400 rounded-2xl p-12 mb-8 shadow-lg transform w-full max-w-2xl" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)">
                    <div class="text-center">
                        <h2 class="text-4xl font-bold text-gray-800 mb-4">QUEUE RECEIPT</h2>
                        <div class="border-b-2 border-dashed border-gray-400 mb-6 pb-4">
                            <p class="text-2xl text-gray-600">{{ new Date().toLocaleDateString() }} - {{ new Date().toLocaleTimeString() }}</p>
                        </div>

                        <div class="mb-6">
                            <p class="text-2xl text-gray-700 mb-2"><strong>Service:</strong> {{ selectedProgram.name }}</p>
                            <p class="text-2xl text-gray-700"><strong>Category:</strong> {{ selectedSector.name }}</p>
                        </div>

                        <div class="border-t-2 border-dashed border-gray-400 pt-6 mb-6">
                            <p class="text-3xl text-gray-800 mb-4">YOUR QUEUE NUMBER</p>
                            <div class="bg-[#2D318F] text-white text-9xl font-bold py-8 px-12 rounded-xl shadow-lg">
                                {{ queueNumber }}
                            </div>
                        </div>

                        <div class="border-t-2 border-dashed border-gray-400 pt-4">
                            <p class="text-lg text-gray-600">Keep this number for reference</p>
                        </div>
                    </div>
                </div>

                <!-- Instructions -->
                <div class="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg mb-8 max-w-2xl">
                    <h3 class="text-2xl font-bold text-blue-800 mb-3">WHAT TO DO NEXT:</h3>
                    <div class="space-y-2">
                        <p class="text-lg text-blue-700 flex items-center">
                            <span class="mr-3">📺</span>
                            Monitor the display screen for your queue number
                        </p>
                        <p class="text-lg text-blue-700 flex items-center">
                            <span class="mr-3">🪑</span>
                            Please take a seat and wait for your turn
                        </p>
                        <p class="text-lg text-blue-700 flex items-center">
                            <span class="mr-3">📄</span>
                            Bring all required documents when called
                        </p>
                        <p class="text-lg text-blue-700 flex items-center">
                            <span class="mr-3">⏰</span>
                            Estimated waiting time: 15-30 minutes
                        </p>
                    </div>
                </div>

                <!-- Thank you message -->

                <!-- Thank you message -->
                <p class="text-2xl text-gray-600 text-center mb-8">Thank you for using our Self-Verification Kiosk!</p>

                <!-- OK Button -->
                <button @click="resetKiosk" class="bg-[#2D318F] hover:bg-[#1e256b] text-white text-3xl font-bold py-6 px-16 rounded-xl shadow-lg transition-colors duration-300 transform hover:scale-105">OK</button>
            </div>
        </div>
        <div v-else class="bg-white rounded-3xl shadow-2xl p-8 flex items-center justify-center" style="height: 90vh; width: 90vw">
            <div class="w-full h-full flex">
                <Stepper v-model:value="activeStep" class="w-full h-full flex flex-col" linear>
                    <StepList>
                        <Step v-slot="{ activateCallback, value, a11yAttrs }" asChild :value="1">
                            <div class="flex flex-row flex-auto gap-2" v-bind="a11yAttrs.root">
                                <button class="bg-transparent border-0 inline-flex flex-col gap-2" @click="activateCallback" v-bind="a11yAttrs.header">
                                    <span :class="['rounded-full border-2 w-12 h-12 inline-flex items-center justify-center', { 'bg-[#2D318F] text-white': value <= activeStep, 'border-surface-200 dark:border-surface-700': value > activeStep }]">
                                        <p>1</p>
                                    </span>
                                </button>
                                <Divider />
                            </div>
                        </Step>
                        <Step v-slot="{ activateCallback, value, a11yAttrs }" asChild :value="2">
                            <div class="flex flex-row flex-auto gap-2" v-bind="a11yAttrs.root">
                                <button class="bg-transparent border-0 inline-flex flex-col gap-2" @click="activateCallback" v-bind="a11yAttrs.header">
                                    <span :class="['rounded-full border-2 w-12 h-12 inline-flex items-center justify-center', { 'bg-[#2D318F] text-white': value <= activeStep, 'border-surface-200 dark:border-surface-700': value > activeStep }]">
                                        <p>2</p>
                                    </span>
                                </button>
                                <Divider />
                            </div>
                        </Step>
                        <Step v-slot="{ activateCallback, value, a11yAttrs }" asChild :value="3">
                            <div class="flex flex-row flex-auto gap-2" v-bind="a11yAttrs.root">
                                <button class="bg-transparent border-0 inline-flex flex-col gap-2" @click="activateCallback" v-bind="a11yAttrs.header">
                                    <span :class="['rounded-full border-2 w-12 h-12 inline-flex items-center justify-center', { 'bg-[#2D318F] text-white': value <= activeStep, 'border-surface-200 dark:border-surface-700': value > activeStep }]">
                                        <p>3</p>
                                    </span>
                                </button>
                                <Divider />
                            </div>
                        </Step>
                        <Step v-slot="{ activateCallback, value, a11yAttrs }" asChild :value="4">
                            <div class="flex flex-row flex-auto gap-2" v-bind="a11yAttrs.root">
                                <button class="bg-transparent border-0 inline-flex flex-col gap-2" @click="activateCallback" v-bind="a11yAttrs.header">
                                    <span :class="['rounded-full border-2 w-12 h-12 inline-flex items-center justify-center', { 'bg-[#2D318F] text-white': value <= activeStep, 'border-surface-200 dark:border-surface-700': value > activeStep }]">
                                        <p>4</p>
                                    </span>
                                </button>
                                <Divider />
                            </div>
                        </Step>
                        <Step v-slot="{ activateCallback, value, a11yAttrs }" asChild :value="5">
                            <div class="flex flex-row flex-auto gap-2" v-bind="a11yAttrs.root">
                                <button class="bg-transparent border-0 inline-flex flex-col gap-2" @click="activateCallback" v-bind="a11yAttrs.header">
                                    <span :class="['rounded-full border-2 w-12 h-12 inline-flex items-center justify-center', { 'bg-[#2D318F] text-white': value <= activeStep, 'border-surface-200 dark:border-surface-700': value > activeStep }]">
                                        <p>5</p>
                                    </span>
                                </button>
                                <Divider />
                            </div>
                        </Step>
                        <Step v-slot="{ activateCallback, value, a11yAttrs }" asChild :value="6">
                            <div class="flex flex-row flex-auto gap-2" v-bind="a11yAttrs.root">
                                <button class="bg-transparent border-0 inline-flex flex-col gap-2" @click="activateCallback" v-bind="a11yAttrs.header">
                                    <span :class="['rounded-full border-2 w-12 h-12 inline-flex items-center justify-center', { 'bg-[#2D318F] text-white': value <= activeStep, 'border-surface-200 dark:border-surface-700': value > activeStep }]">
                                        <p>6</p>
                                    </span>
                                </button>
                            </div>
                        </Step>
                    </StepList>

                    <StepPanels class="flex-1 flex flex-col w-full h-full justify-center">
                        <StepPanel v-slot="{ activateCallback }" :value="1">
                            <Transition name="fade-slide" mode="out-in">
                                <template v-if="activeStep === 1">
                                    <div class="flex flex-col gap-5 mx-auto mt-4 h-full w-full justify-center items-center" style="max-width: 85%" key="step1">
                                        <h1 class="text-center text-4xl mt-4 mb-4 text-[#2D318F] font-bold">PRIVACY NOTICE</h1>
                                        <div class="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 w-full max-w-4xl text-gray-800 overflow-y-auto" style="max-height: 50vh">
                                            <div class="space-y-4 text-sm">
                                                <!-- Header -->
                                                <div class="text-center mb-6">
                                                    <h2 class="text-lg font-bold text-[#2D318F] mb-2">Department of Social Welfare and Development</h2>
                                                    <h3 class="text-base font-semibold">VALID System (Verification and Authentication for Legitimate Identification)</h3>
                                                    <h4 class="text-base font-semibold text-gray-700 mt-2">PRIVACY NOTICE AND CONSENT</h4>
                                                </div>

                                                <!-- Introduction -->
                                                <div class="mb-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                                    <p class="font-medium">
                                                        The Department of Social Welfare and Development (DSWD) is committed to protecting your personal data privacy and ensuring transparency in our data processing activities. This Privacy Notice
                                                        explains how we collect, use, store, and protect your personal information through the VALID System.
                                                    </p>
                                                </div>

                                                <!-- Data Collection Section -->
                                                <div class="mb-4">
                                                    <h3 class="font-bold text-base text-[#2D318F] mb-2">1. PERSONAL INFORMATION WE COLLECT</h3>
                                                    <p class="mb-3">When you use the VALID Kiosk, we collect the following information: full name, date of birth, and selfie image (for identity verification).</p>
                                                </div>

                                                <!-- Purpose Section -->
                                                <div class="mb-4">
                                                    <h3 class="font-bold text-base text-[#2D318F] mb-2">2. PURPOSE OF DATA COLLECTION</h3>
                                                    <p class="mb-3">
                                                        Your personal data is collected for the sole purpose of verifying your identity through the Philippine Statistics Authority (PSA) PhilSys API. This helps us confirm if you have a valid PhilSys
                                                        ID and ensures accurate and secure client validation for DSWD programs and services.
                                                    </p>
                                                </div>

                                                <!-- Legal Basis -->
                                                <div class="mb-4">
                                                    <h3 class="font-bold text-base text-[#2D318F] mb-2">3. DATA SHARING AND DISCLOSURE</h3>
                                                    <p class="mb-2">Data collection and processing is authorized under:</p>
                                                    <ul class="list-disc pl-6 space-y-1 text-sm">
                                                        <li>Your data is transmitted securely to the PSA PhilSys API for identity verification.</li>
                                                        <li>No other third party will have access to your data unless required by law or with your consent.</li>
                                                        <li>DSWD does not sell, rent, or trade your personal data.</li>
                                                    </ul>
                                                </div>

                                                <!-- Data Sharing -->
                                                <div class="mb-4">
                                                    <h3 class="font-bold text-base text-[#2D318F] mb-2">4. Data Retention</h3>
                                                    <p class="mb-2">Your personal data may be shared with:</p>
                                                    <ul class="list-disc pl-6 space-y-1 text-sm">
                                                        <li>Your name, birthdate, and selfie are retained only for as long as necessary to complete the validation process.</li>
                                                        <li>After verification, your data will be securely stored following DSWD’s retention policies or disposed of in accordance with government rules on data disposal.</li>
                                                    </ul>
                                                </div>

                                                <!-- Data Security -->
                                                <div class="mb-4">
                                                    <h3 class="font-bold text-base text-[#2D318F] mb-2">5. YOUR RIGHTS AS A DATA SUBJECT</h3>
                                                    <p class="mb-2">Under the Data Privacy Act, you have the right to:</p>
                                                    <ul class="list-disc pl-6 space-y-1 text-sm">
                                                        <li><strong>Right to Be Informed</strong></li>
                                                        <li><strong>Right of Access</strong></li>
                                                        <li><strong>Right to Rectification</strong></li>
                                                        <li><strong>Right to Erasure</strong></li>
                                                        <li><strong>Right to Data Portability</strong></li>
                                                        <li><strong>Right to Object</strong></li>
                                                        <li><strong>Right to Withdraw Consent</strong></li>
                                                    </ul>
                                                </div>

                                                <!-- Your Rights -->
                                                <div class="mb-4">
                                                    <h3 class="font-bold text-base text-[#2D318F] mb-2">6. DATA PROTECTION MEASURES</h3>
                                                    <p class="mb-2">We apply organizational, physical, and technical safeguards to protect your data, including:</p>
                                                    <ul class="list-disc pl-6 space-y-1 text-sm">
                                                        <li>Encrypted transmission to PSA PhilSys API</li>
                                                        <li>Role-based access controls for authorized personnel</li>
                                                        <li>Secure system logs and monitoring</li>
                                                    </ul>
                                                </div>

                                                <!-- Contact Information -->
                                                <div class="mb-4">
                                                    <h3 class="font-bold text-base text-[#2D318F] mb-2">7. CONTACT INFORMATION</h3>
                                                    <div class="bg-gray-50 p-3 rounded border">
                                                        <p>
                                                            For questions, concerns, or complaints regarding your data, please contact our Compliance Officer for Privacy (COP) through <strong>cop.fo3@dswd.gov.ph</strong> or Data Protection Officer
                                                            (DPO) via <strong>dpo@dswd.gov.ph</strong>.
                                                        </p>
                                                        <p>You may also file a complaint with the National Privacy Commission at <strong>www.privacy.gov.ph</strong></p>
                                                    </div>
                                                </div>

                                                <!-- Consent -->
                                                <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                                    <h3 class="font-bold text-base text-[#2D318F] mb-2">YOUR CONSENT</h3>
                                                    <p class="font-medium">
                                                        By checking the consent box below and proceeding with this kiosk, you acknowledge that you have read, understood, and agree to this Privacy Notice. You consent to the collection, use,
                                                        processing, and storage of your personal data as described above.
                                                    </p>
                                                </div>

                                                <!-- Consent Checkbox at the very bottom of privacy policy -->
                                                <div class="flex items-start mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                                    <input id="privacy-agree" type="checkbox" v-model="privacyAgreed" class="w-6 h-6 mr-4 mt-1 accent-[#2D318F] flex-shrink-0" />
                                                    <label for="privacy-agree" class="text-lg font-semibold select-none text-gray-800 leading-relaxed">
                                                        I have read and understood the Privacy Notice and Consent above. I hereby give my free, prior, and informed consent for DSWD to collect, use, process, and store my personal data as described in
                                                        this notice. I understand my rights as a data subject and how to exercise them.
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Buttons -->
                                        <div class="flex gap-4 w-full max-w-4xl mt-6">
                                            <button class="flex-1 bg-gray-500 text-white text-2xl py-4 rounded-xl shadow-lg hover:bg-gray-600 transition" @click="resetKiosk">Cancel</button>
                                            <button
                                                class="flex-1 bg-[#2D318F] text-white text-2xl py-4 rounded-xl shadow-lg hover:bg-[#1e256b] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                :disabled="!privacyAgreed"
                                                @click="activateCallback(2)"
                                            >
                                                I Agree - Continue
                                            </button>
                                        </div>
                                    </div>
                                </template>
                            </Transition>
                        </StepPanel>
                        <StepPanel v-slot="{ activateCallback }" :value="2">
                            <Transition name="fade-slide" mode="out-in">
                                <template v-if="activeStep === 2">
                                    <div class="flex flex-col gap-5 mx-auto mt-4 h-full w-full justify-center items-center" style="max-width: 80%" key="step1">
                                        <h1 class="text-center text-6xl mt-4 mb-0">SELECT CLIENT TYPE</h1>
                                        <p class="text-center text-gray-400 text-3xl"><i>Specify whether you have used VALID before or not</i></p>
                                        <TransitionGroup name="scale-fade" tag="div" class="w-full">
                                            <div class="field w-full" v-for="(type, index) in clientTypeList" :key="type.value">
                                                <button
                                                    class="mb-6 w-full flex items-center justify-center text-left text-white text-center p-20 h-[10rem] text-5xl rounded-2xl shadow-lg shadow-[#1e293b]/60 sector-btn bg-[#2D318F] overflow-hidden relative group"
                                                    @click="handleClientTypeClick(type, 3, activateCallback)"
                                                >
                                                    <span class="absolute inset-0 rounded-2xl sector-bg pointer-events-none"></span>
                                                    <span class="px-8 py-2 rounded-md relative z-10 font-bold uppercase">{{ type.name }}</span>
                                                </button>
                                            </div>

                                            <button
                                                class="mt-8 text-[#2D318F] border border-[#2D318F] text-3xl w-full py-6 rounded-xl hover:bg-[#2D318F] hover:text-white transition disabled:opacity-50"
                                                :disabled="!privacyAgreed"
                                                @click="activateCallback(1)"
                                            >
                                                Go Back
                                            </button>
                                        </TransitionGroup>
                                    </div>
                                </template>
                            </Transition>
                        </StepPanel>
                        <StepPanel v-slot="{ activateCallback }" :value="3">
                            <Transition name="fade-slide" mode="out-in">
                                <template v-if="activeStep === 3">
                                    <div class="flex flex-col gap-5 mx-auto mt-4 h-full w-full justify-center items-center" style="max-width: 80%" key="step1">
                                        <h1 class="text-center text-6xl mt-4 mb-0">SELECT SECTOR</h1>
                                        <p class="text-center text-gray-400 text-3xl"><i>Specify which sector you belong to</i></p>
                                        <TransitionGroup name="scale-fade" tag="div" class="w-full">
                                            <div class="field w-full" v-for="(sector, index) in sectors" :key="sector.value">
                                                <button
                                                    class="mb-6 w-full flex items-center justify-center text-left text-white text-center p-20 h-[10rem] text-5xl rounded-2xl shadow-lg shadow-[#1e293b]/60 sector-btn bg-[#2D318F] overflow-hidden relative group gap-8"
                                                    @click="handleSectorClick(sector, 4, activateCallback)"
                                                >
                                                    <span class="absolute inset-0 rounded-2xl sector-bg pointer-events-none"></span>
                                                    <span class="relative z-10 flex items-center gap-8">
                                                        <span :class="sector.icon" aria-hidden="true" style="font-size: 2.5rem"></span>
                                                        <span class="px-8 py-2 rounded-md font-bold uppercase">{{ sector.name }}</span>
                                                    </span>
                                                </button>
                                            </div>

                                            <button
                                                class="mt-8 text-[#2D318F] border border-[#2D318F] text-3xl w-full py-6 rounded-xl hover:bg-[#2D318F] hover:text-white transition disabled:opacity-50"
                                                :disabled="!privacyAgreed"
                                                @click="activateCallback(2)"
                                            >
                                                Go Back
                                            </button>
                                        </TransitionGroup>
                                    </div>
                                </template>
                            </Transition>
                        </StepPanel>
                        <StepPanel v-slot="{ activateCallback }" :value="4">
                            <Transition name="fade-slide" mode="out-in">
                                <template v-if="activeStep === 4">
                                    <div class="flex flex-col gap-5 mx-auto mt-4 h-full w-full justify-center items-center" style="max-width: 80%" key="step2">
                                        <h1 class="text-center text-6xl mt-4 mb-0">SELECT PROGRAM</h1>
                                        <p class="text-center text-gray-400 text-3xl"><i>Specify which program you want to apply to</i></p>
                                        <!-- Make the button list scrollable -->
                                        <div class="w-full" style="max-height: 50vh; overflow-y: auto">
                                            <TransitionGroup name="scale-fade" tag="div" class="w-full">
                                                <div class="field w-full" v-for="(program, index) in programs" :key="program.value">
                                                    <button
                                                        class="mb-6 w-full flex items-center justify-center text-left text-white text-center p-20 h-[10rem] text-5xl rounded-2xl shadow-lg sector-btn bg-[#2D318F] shadow-[#1e293b]/60 overflow-hidden relative group"
                                                        @click="handleProgramClick(program, 5, activateCallback)"
                                                    >
                                                        <span class="absolute inset-0 rounded-2xl pointer-events-none" style="background: rgba(30, 41, 59, 0.2); z-index: 2"></span>
                                                        <span class="px-8 py-2 rounded-md relative z-10 font-bold uppercase">{{ program.name }}</span>
                                                    </button>
                                                </div>

                                                <button
                                                    class="mt-8 text-[#2D318F] border border-[#2D318F] text-3xl w-full py-6 rounded-xl hover:bg-[#2D318F] hover:text-white transition disabled:opacity-50"
                                                    :disabled="!privacyAgreed"
                                                    @click="activateCallback(3)"
                                                >
                                                    Go Back
                                                </button>
                                            </TransitionGroup>
                                        </div>
                                        <div class="field w-full"></div>
                                    </div>
                                </template>
                            </Transition>
                        </StepPanel>
                        <StepPanel v-slot="{ activateCallback }" :value="5">
                            <Transition name="fade-slide" mode="out-in">
                                <template v-if="activeStep === 5">
                                    <div v-if="selectedClientType == 2" class="flex flex-col gap-5 mx-auto mt-4 h-full w-full justify-center items-center" style="max-width: 80%" key="step3">
                                        <h1 class="text-center mt-2 mb-2">Enter Your Details</h1>
                                        <div class="w-full max-w-xl flex flex-col gap-6">
                                            <!-- First Name -->
                                            <div class="field">
                                                <label class="block mb-2 text-xl font-semibold">First Name</label>
                                                <input v-model="clientDetails.firstName" type="text" class="w-full p-6 text-3xl rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter first name" />
                                            </div>
                                            <!-- Middle Name -->
                                            <div class="field">
                                                <label class="block mb-2 text-xl font-semibold">Middle Name</label>
                                                <input v-model="clientDetails.middleName" type="text" class="w-full p-6 text-3xl rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter middle name" />
                                            </div>
                                            <!-- Last Name and Suffix in one row -->
                                            <div class="field flex gap-4">
                                                <div class="flex-1">
                                                    <label class="block mb-2 text-xl font-semibold">Last Name</label>
                                                    <input v-model="clientDetails.lastName" type="text" class="w-full p-6 text-3xl rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter last name" />
                                                </div>
                                                <div class="w-48">
                                                    <label class="block mb-2 text-xl font-semibold">Suffix</label>
                                                    <select v-model="clientDetails.suffix" class="w-full p-6 text-3xl rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary">
                                                        <option value="">None</option>
                                                        <option value="Jr.">Jr.</option>
                                                        <option value="Sr.">Sr.</option>
                                                        <option value="II">II</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <!-- Birth Date -->
                                            <!-- <div class="field">
                                                <label class="block mb-2 text-xl font-semibold">Birth Date</label>
                                                <input v-model="clientDetails.birthDate" type="date" class="w-full p-6 text-3xl rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div> -->

                                            <div class="field">
                                                <label class="block mb-2 text-xl font-semibold">Birth Date</label>
                                                <SpinnerDatePicker v-model="clientDetails.birthDate" />
                                            </div>
                                            <!-- Submit Button -->
                                            <div class="field flex gap-6">
                                                <button
                                                    class="text-[#2D318F] border border-[#2D318F] text-3xl flex-1 py-6 rounded-xl hover:bg-[#2D318F] hover:text-white transition disabled:opacity-50"
                                                    :disabled="!privacyAgreed"
                                                    @click="activateCallback(4)"
                                                >
                                                    Go Back
                                                </button>
                                                <button type="button" class="bg-[#2D318F] text-white text-3xl flex-1 py-6 rounded-xl shadow-lg hover:bg-[#2D318F] transition" @click="activateCallback(6)">Next</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="flex flex-col gap-5 mx-auto mt-4 h-full w-full justify-center items-center" style="max-width: 80%" key="step31">
                                        <h1 class="text-center mt-2 mb-2">Enter Your Details</h1>
                                        <div class="w-full max-w-xl flex flex-col gap-6">
                                            <!-- Bene ID -->
                                            <div class="field">
                                                <label class="block mb-2 text-xl font-semibold">Beneficiary ID</label>
                                                <input
                                                    v-model="clientDetails.beneficiary_id"
                                                    type="text"
                                                    class="w-full p-6 text-3xl rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="Enter Beneficiary ID"
                                                />
                                            </div>
                                            <!-- Submit Button -->
                                            <div class="field flex gap-6">
                                                <button
                                                    class="text-[#2D318F] border border-[#2D318F] text-3xl flex-1 py-6 rounded-xl hover:bg-[#2D318F] hover:text-white transition disabled:opacity-50"
                                                    :disabled="!privacyAgreed"
                                                    @click="activateCallback(4)"
                                                >
                                                    Go Back
                                                </button>
                                                <button type="button" class="bg-[#2D318F] text-white text-3xl flex-1 py-6 rounded-xl shadow-lg hover:bg-[#2D318F] transition" @click="activateCallback(6)">Next</button>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </Transition>
                        </StepPanel>
                        <StepPanel v-slot="{ activateCallback }" :value="6">
                            <Transition name="fade-slide" mode="out-in">
                                <template v-if="activeStep === 6">
                                    <!-- Consent Decline Message -->
                                    <div v-if="showConsentDeclineMessage" class="flex flex-col gap-8 mx-auto mt-4 h-full w-full justify-center items-center" style="max-width: 80%" key="consent-decline">
                                        <div class="bg-red-50 border-2 border-red-200 rounded-xl p-8 w-full max-w-3xl text-center">
                                            <div class="mb-6">
                                                <svg class="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                                <h2 class="text-4xl font-bold text-red-600 mb-4">CANNOT PROCEED</h2>
                                            </div>

                                            <div class="bg-white rounded-lg p-6 mb-6 border-l-4 border-red-400">
                                                <p class="text-2xl text-gray-800 leading-relaxed">
                                                    We cannot proceed with identity validation without your consent to collect and process your personal data. Please approach the DSWD staff for alternative assistance.
                                                </p>
                                            </div>

                                            <div class="flex gap-4 justify-center">
                                                <button class="bg-gray-500 text-white text-2xl py-4 px-8 rounded-xl shadow-lg hover:bg-gray-600 transition" @click="activateCallback(5)">Go Back</button>
                                                <button class="bg-red-500 text-white text-2xl py-4 px-8 rounded-xl shadow-lg hover:bg-red-600 transition" @click="resetKiosk">Exit Kiosk</button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Consent Statement -->
                                    <div v-else class="flex flex-col gap-6 mx-auto mt-4 h-full w-full justify-center items-center" style="max-width: 85%" key="consent-step">
                                        <h1 class="text-center text-4xl mt-4 mb-4 text-[#2D318F] font-bold">CONSENT FOR DATA PROCESSING</h1>

                                        <div class="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6 w-full max-w-4xl text-gray-800">
                                            <div class="space-y-4">
                                                <!-- Summary of entered data -->
                                                <!-- <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mb-4">
                                                    <h3 class="font-bold text-lg text-[#2D318F] mb-2">Data to be Processed:</h3>
                                                    <div class="grid grid-cols-2 gap-4 text-base">
                                                        <div><strong>Name:</strong> {{ clientDetails.firstName }} {{ clientDetails.middleName }} {{ clientDetails.lastName }} {{ clientDetails.suffix }}</div>
                                                        <div><strong>Birth Date:</strong> {{ clientDetails.birthDate }}</div>
                                                        <div v-if="clientDetails.beneficiary_id"><strong>Beneficiary ID:</strong> {{ clientDetails.beneficiary_id }}</div>
                                                        <div><strong>Service:</strong> {{ selectedProgram?.name }}</div>
                                                        <div><strong>Category:</strong> {{ selectedSector?.name }}</div>
                                                    </div>
                                                </div> -->

                                                <!-- Consent Statement -->
                                                <div class="p-4 my-6 rounded-lg">
                                                    <h3 class="font-bold text-lg text-center text-[#2D318F] mb-3">CONSENT STATEMENT</h3>

                                                    <p class="text-base leading-relaxed mb-4 text-gray-800 text-center">
                                                        By proceeding, you voluntarily give your consent to the <strong>Department of Social Welfare and Development (DSWD) Field Office III</strong> to collect and process your personal data, including
                                                        your <strong>name, date of birth, and selfie image</strong>, for the purpose of validating your identity through the <strong>Philippine Statistics Authority (PSA) PhilSys database</strong>.
                                                    </p>

                                                    <p class="text-base leading-relaxed font-medium text-gray-800 text-center">
                                                        Your data will only be used for verification, stored securely, and not shared with other parties except as required by law. You may exercise your rights under the
                                                        <strong>Data Privacy Act of 2012</strong>, including the rights to access, correct, or withdraw your information, by submitting a Data Subject Request. For more details, please view our Privacy
                                                        Notice or contact our Compliance Officer for Privacy / Data Protection Office.
                                                    </p>
                                                </div>

                                                <!-- Warning Notice -->
                                                <div class="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                                                    <p class="text-base font-medium text-red-800">
                                                        <strong>Important:</strong> If you do not consent to this data processing, we cannot proceed with the biometric verification and you will need to seek alternative assistance from DSWD staff.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Consent Options -->
                                        <div class="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 w-full max-w-4xl">
                                            <p class="text-lg text-center mb-6 text-gray-700">Do you give your free, voluntary, and informed consent to process your personal data as described above?</p>

                                            <div class="flex gap-6 justify-center">
                                                <!-- I Do Not Consent Button -->
                                                <label class="flex items-center cursor-pointer">
                                                    <input type="radio" name="consent" :value="false" v-model="consentGiven" class="hidden" />
                                                    <div
                                                        :class="[
                                                            'flex items-center justify-center px-8 py-4 rounded-xl border-2 text-xl font-bold transition-all',
                                                            consentGiven === false ? 'bg-red-500 text-white border-red-500 shadow-lg transform scale-105' : 'bg-white text-red-500 border-red-500 hover:bg-red-50'
                                                        ]"
                                                    >
                                                        <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        I Do Not Consent
                                                    </div>
                                                </label>

                                                <!-- I Agree/Proceed Button -->
                                                <label class="flex items-center cursor-pointer">
                                                    <input type="radio" name="consent" :value="true" v-model="consentGiven" class="hidden" />
                                                    <div
                                                        :class="[
                                                            'flex items-center justify-center px-8 py-4 rounded-xl border-2 text-xl font-bold transition-all',
                                                            consentGiven === true ? 'bg-green-500 text-white border-green-500 shadow-lg transform scale-105' : 'bg-white text-green-500 border-green-500 hover:bg-green-50'
                                                        ]"
                                                    >
                                                        <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        I Agree / Proceed
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <!-- Action Buttons -->
                                        <div class="flex gap-6 w-full max-w-4xl mt-6">
                                            <button class="flex-1 bg-gray-500 text-white text-2xl py-4 rounded-xl shadow-lg hover:bg-gray-600 transition" @click="activateCallback(5)">Go Back</button>
                                            <button
                                                class="flex-1 bg-[#2D318F] text-white text-2xl py-4 rounded-xl shadow-lg hover:bg-[#1e256b] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                :disabled="consentGiven === null"
                                                @click="handleConsentSubmission"
                                            >
                                                Continue
                                            </button>
                                        </div>
                                    </div>
                                </template>
                            </Transition>
                        </StepPanel>
                    </StepPanels>
                </Stepper>
            </div>
        </div>
    </div>
    <Toast />
    <ConfirmDialog />
</template>

<script setup>
import SpinnerDatePicker from '@/components/SpinnerDatePicker.vue';
import { psaAxiosInstance } from '@/interceptors/axiosInstances.js';
import setupPSAInterceptor from '@/interceptors/psaInterceptors';
import PsaServices from '@/service/psa/PsaServices';
import queueManagement from '@/service/settings/queueManagement';
import VerifiedClientsServices from '@/service/verifiedClients/verifiedClients';
import Cookies from 'js-cookie';
import moment from 'moment';
import { useToast } from 'primevue';
import { useConfirm } from 'primevue/useconfirm';
import { ref, watch } from 'vue';
const emit = defineEmits(['resetKiosk']);
const confirm = useConfirm();
const toast = useToast();
const isLivenessDialogVisible = ref(false);
const verificationResultModal = ref(false);
const privacyAgreed = ref(false);
const consentGiven = ref(null); // null = not selected, true = agreed, false = disagreed
const showConsentDeclineMessage = ref(false);
const showSuccessScreen = ref(false);
const verificationResult = ref({});
const verificationResultMessage = ref('');
const verificationResultHeader = ref('');
const queueNumber = ref(null);
const clientTypeList = ref([
    { name: 'Old', value: 1 },
    { name: 'New', value: 2 }
]);

const sectors = ref([
    { name: 'GENERAL', value: 3, bg: '/demo/images/regular.jpg', icon: 'fa-solid fa-users' },
    { name: 'PWD', value: 1, bg: '/demo/images/pwd.jpg', icon: 'fa-solid fa-wheelchair' },
    { name: 'SENIOR', value: 2, bg: '/demo/images/senior_citizens.jpg', icon: 'fa-solid fa-person-cane' }
]);

const programs = ref([
    { name: 'AICS', value: 1, bg: '/demo/images/redvest.jpg' },
    { name: 'AKAP', value: 2, bg: '/demo/images/redvest.jpg' }
]);

const verification_session_id = ref();
const isInvalid = ref(false);
const loading = ref(false);
const verifiedClients = ref([]);
const activeStep = ref(1);
const selectedSector = ref(null);
const selectedProgram = ref(null);
const verificationType = ref(null);
const selectedClientType = ref(null);
const clientDetails = ref({
    lastName: '',
    firstName: '',
    middleName: '',
    suffix: '',
    birthDate: '',
    beneficiaryID: ''
});

const handleClientTypeClick = (clientType, section, activateCallback) => {
    activateCallback(section);
    selectedClientType.value = clientType.value;
    console.log('Selected clientType value:', clientType.value);
};

const handleSectorClick = (sector, section, activateCallback) => {
    activateCallback(section);
    selectedSector.value = sector;
    console.log('Selected sector value:', selectedSector.value);
};

const handleProgramClick = (program, section, activateCallback) => {
    activateCallback(section);
    selectedProgram.value = program;
    console.log('Selected program value:', selectedProgram.value);
};

const handleConsentSubmission = () => {
    if (consentGiven.value === false) {
        // User declined consent
        showConsentDeclineMessage.value = true;
    } else if (consentGiven.value === true) {
        // User gave consent, proceed with verification
        showConsentDeclineMessage.value = false;
        if (selectedClientType.value === 2) {
            searchClient();
        } else {
            getClients();
        }
    }
};

const inputVerification = () => {
    if (!clientDetails.value.lastName || !clientDetails.value.firstName || !clientDetails.value.birthDate) {
        isInvalid.value = true;
        toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please input all required fields', life: 3000 });
        return false;
    }
    isInvalid.value = false;
    return true;
};

const searchClient = async () => {
    const isValid = inputVerification();
    if (!isValid) return;

    loading.value = true;

    verificationType.value = saveClient;
    // await startLiveness();
    await saveClient(clientDetails);
    loading.value = false;

    showSuccessScreen.value = true;
};

const checkPSAtoken = async () => {
    const token = Cookies.get('psa-token');
    if (!token) {
        const psaAuthResult = await PsaServices.authPSA({ client_id: import.meta.env.VITE_PSA_CLIENT_ID, client_secret: import.meta.env.VITE_PSA_CLIENT_SECRET });
        console.log(psaAuthResult.data);
        var in30Minutes = 1 / 48;
        Cookies.set('psa-token', psaAuthResult.data.access_token, {
            expires: in30Minutes
        });
        setupPSAInterceptor(psaAxiosInstance, Cookies.get('psa-token'));
    }
};

const getClients = async () => {
    try {
        loading.value = true;
        await checkPSAtoken();
        const result = await VerifiedClientsServices.getClients({
            beneficiary_id: clientDetails.value.beneficiary_id
        });
        console.log(result.data);

        if (Array.isArray(result.data) && result.data.length > 0) {
            clientDetails.value = {
                lastName: result.data[0].last_name,
                firstName: result.data[0].first_name,
                middleName: result.data[0].middle_name,
                suffix: result.data[0].suffix,
                birthDate: moment(result.data[0].birth_date).format('YYYY-MM-DD'),
                beneficiaryID: result.data[0].beneficiary_id
            };
            console.log(clientDetails.value);
            await getQueueNumber();
            showSuccessScreen.value = true;
        } else {
            toast.add({ severity: 'warn', summary: 'Warning', detail: 'Invalid Beneficiary ID', life: 3000 });
        }
        loading.value = false;
    } catch (error) {
        loading.value = false;
        toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while fetching client data.', life: 3000 });
        console.log(error);
    }
};

const saveClient = async () => {
    console.log(clientDetails.value);
    await checkPSAtoken();
    loading.value = true;
    try {
        const result = await PsaServices.verifyClient({
            last_name: clientDetails.value.lastName,
            first_name: clientDetails.value.firstName,
            middle_name: clientDetails.value.middleName,
            suffix: clientDetails.value.suffix,
            birth_date: moment(clientDetails.value.birthDate).format('YYYY-MM-DD'),
            face_liveness_session_id: verification_session_id.value
        });
        verificationResult.value = result.data;
        console.log('asdf ', verificationResult.value);
        loading.value = false;
        if (!verificationResult.value.code) {
            verificationResultMessage.value = 'Client not found in PhilSys ID database.';
            verificationResultHeader.value = 'Verification Result';
            verificationResultModal.value = true;
            verificationResult.value.isVerified = 0;
            loading.value = true;
            await VerifiedClientsServices.saveClient({
                lastName: clientDetails.value.lastName,
                firstName: clientDetails.value.firstName,
                middleName: clientDetails.value.middleName,
                suffix: clientDetails.value.suffix,
                birth_date: moment(clientDetails.value.birthDate).format('YYYY-MM-DD'),
                verificationResult: verificationResult.value.isVerified
            });
            await getQueueNumber();
            loading.value = false;
        } else {
            verificationResultMessage.value = 'Client verified successfully.';
            verificationResultHeader.value = 'Verification Result';
            verificationResultModal.value = true;
            verificationResult.value.isVerified = 1;

            console.log('asdf2', verificationResult.value);
            loading.value = true;
            await VerifiedClientsServices.saveClient({
                face_url: verificationResult.value.face_url,
                lastName: clientDetails.value.lastName,
                firstName: clientDetails.value.firstName,
                middleName: clientDetails.value.middleName,
                suffix: clientDetails.value.suffix,
                birth_date: moment(clientDetails.value.birthDate).format('YYYY-MM-DD'),
                psn: verificationResult.value.reference,
                sex: verificationResult.value.gender,
                marital_status: verificationResult.value.marital_status,
                email: verificationResult.value.email,
                mobile_number: verificationResult.value.mobile_number,
                address_line_1: verificationResult.value.address_line_1,
                address_line_2: verificationResult.value.address_line_2,
                barangay: verificationResult.value.barangay,
                municipality: verificationResult.value.municipality,
                province: verificationResult.value.province,
                country: verificationResult.value.country,
                postal_code: verificationResult.value.postal_code,
                present_address_line_1: verificationResult.value.present_address_line_1,
                present_address_line_2: verificationResult.value.present_address_line_2,
                present_barangay: verificationResult.value.present_barangay,
                present_municipality: verificationResult.value.present_municipality,
                present_province: verificationResult.value.present_province,
                present_country: verificationResult.value.present_country,
                present_postal_code: verificationResult.value.present_postal_code,
                residency_status: verificationResult.value.residency_status,
                place_of_birth: verificationResult.value.place_of_birth,
                pob_municipality: verificationResult.value.pob_municipality,
                pob_province: verificationResult.value.pob_province,
                pob_country: verificationResult.value.pob_country,
                verified_by: verificationResult.value.verified_by,
                verificationResult: verificationResult.value.isVerified
            });
            await getQueueNumber();
            loading.value = false;
        }
    } catch (error) {
        loading.value = false;
        verificationResultMessage.value = 'An error occurred while verifying the client. Please try again.';
        verificationResultHeader.value = 'Verification Error';
        verificationResultModal.value = true;
        // Always save client even on error
        loading.value = true;
        await VerifiedClientsServices.saveClient({
            lastName: clientDetails.value.lastName,
            firstName: clientDetails.value.firstName,
            middleName: clientDetails.value.middleName,
            suffix: clientDetails.value.suffix,
            birth_date: moment(clientDetails.value.birthDate).format('YYYY-MM-DD'),
            verificationResult: 0
        });
        await getQueueNumber();
        loading.value = false;
    }
};

const reverifyClient = async (clientDetails) => {
    await checkPSAtoken();
    console.log('Re-verify client');
    loading.value = true;
    const result = await PsaServices.verifyClient({
        last_name: clientDetails.last_name,
        first_name: clientDetails.first_name,
        middle_name: clientDetails.middle_name,
        suffix: clientDetails.suffix_name,
        birth_date: moment(clientDetails.birth_date).format('YYYY-MM-DD'),
        face_liveness_session_id: verification_session_id.value
    });
    verificationResult.value = result.data;
    console.log('asdf ', verificationResult.value);
    loading.value = false;
    if (!verificationResult.value || Object.keys(verificationResult.value).length === 0) {
        verificationResult.value.isVerified = 0;
    } else {
        verificationResult.value.isVerified = 1;
        console.log('asdf2', verificationResult.value);
        const result = await VerifiedClientsServices.updateClient({
            id: clientData.id,
            lastName: lastName.value,
            firstName: firstName.value,
            middleName: middleName.value,
            suffix: suffix.value,
            birth_date: moment(dob.value).format('YYYY-MM-DD'),
            face_url: verificationResult.value.face_url,
            psn: verificationResult.value.reference,
            sex: verificationResult.value.gender,
            marital_status: verificationResult.value.marital_status,
            email: verificationResult.value.email,
            mobile_number: verificationResult.value.mobile_number,
            address_line_1: verificationResult.value.address_line_1,
            address_line_2: verificationResult.value.address_line_2,
            barangay: verificationResult.value.barangay,
            municipality: verificationResult.value.municipality,
            province: verificationResult.value.province,
            country: verificationResult.value.country,
            postal_code: verificationResult.value.postal_code,
            present_address_line_1: verificationResult.value.present_address_line_1,
            present_address_line_2: verificationResult.value.present_address_line_2,
            present_barangay: verificationResult.value.present_barangay,
            present_municipality: verificationResult.value.present_municipality,
            present_province: verificationResult.value.present_province,
            present_country: verificationResult.value.present_country,
            present_postal_code: verificationResult.value.present_postal_code,
            residency_status: verificationResult.value.residency_status,
            place_of_birth: verificationResult.value.place_of_birth,
            pob_municipality: verificationResult.value.pob_municipality,
            pob_province: verificationResult.value.pob_province,
            pob_country: verificationResult.value.pob_country,
            verified_by: verificationResult.value.verified_by,
            verificationResult: verificationResult.value.isVerified
        });
    }
};

const startLiveness = () => {
    console.log('Client Details:', clientDetails.value);
    window
        .eKYC()
        .start({
            pubKey: 'eyJpdiI6IjNVK2NPNEVvYUQxbVlmZEU4REV0bmc9PSIsInZhbHVlIjoibUJHT3VNWUxBdm11VnQzc0xvZmpjZz09IiwibWFjIjoiNDlkOWRjZTY5MDVmNDcwZmRlOWFmZTg2NmQ2MTcwNjE0NWY1YTRkNjczMTRjMWQ0NGQ2YWM4NjkwMzQ4NTRjZiIsInRhZyI6IiJ9'
        })
        .then(async (data) => {
            verification_session_id.value = data.result.session_id;
            console.log(verification_session_id.value);
            isLivenessDialogVisible.value = false;
        })
        .catch(async (err) => {
            await saveClient();
            console.log('error', err);
        });
};

const saveVerificationResult = async () => {
    verificationResultModal.value = false;
    console.log('Saving verification result');
};

const getQueueNumber = async () => {
    try {
        const response = await queueManagement.getQueueNumber({
            sector_id: selectedSector.value.value,
            program_id: selectedProgram.value.value
        });
        if (response && response.data) {
            queueNumber.value = response.data.last_queue_number;
            console.log('Queue Number Response:', queueNumber.value);
        } else {
            toast.add({ severity: 'warn', summary: 'Warning', detail: 'Unable to fetch queue number.', life: 3000 });
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while fetching queue number.', life: 3000 });
        console.log(error);
    }
};

const resetKiosk = () => {
    showSuccessScreen.value = false;
    activeStep.value = 1;
    privacyAgreed.value = false;
    consentGiven.value = null;
    showConsentDeclineMessage.value = false;
    selectedSector.value = null;
    selectedProgram.value = null;
    selectedClientType.value = null;
    clientDetails.value = {
        lastName: '',
        firstName: '',
        middleName: '',
        suffix: '',
        birthDate: '',
        beneficiaryID: ''
    };
    emit('resetKiosk');
};

watch(showSuccessScreen, (val) => {
    if (val) {
        setTimeout(() => {
            resetKiosk();
        }, 100000);
    }
});
</script>

<style scoped>
.sector-btn .sector-bg {
    filter: blur(1px) grayscale(1);
    transition: filter 0.3s;
    z-index: 1;
}
.sector-btn:hover .sector-bg,
.sector-btn:focus .sector-bg {
    filter: blur(0.3px) grayscale(0.5);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition:
        opacity 0.4s,
        transform 0.4s;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
}
.fade-slide-enter-to,
.fade-slide-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}

.scale-fade-enter-active,
.scale-fade-leave-active {
    transition:
        opacity 0.3s,
        transform 0.3s;
}
.scale-fade-enter-from,
.scale-fade-leave-to {
    opacity: 0;
    transform: scale(0.95);
}
.scale-fade-enter-to,
.scale-fade-leave-from {
    opacity: 1;
    transform: scale(1);
}
</style>
