import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { PropsWithChildren } from 'react';

export default function SlideOver({
    children,
    show = false,
    onClose,
    title,
}: PropsWithChildren<{
    show: boolean;
    onClose: () => void;
    title?: string;
}>) {
    return (
        <Transition show={show}>
            <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500/75" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <TransitionChild
                                enter="transform transition ease-in-out duration-300"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-200"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <DialogPanel className="pointer-events-auto w-screen max-w-lg">
                                    <div className="flex h-full flex-col border-l-3 border-brand-black bg-white shadow-brutal">
                                        {/* Header */}
                                        <div className="flex items-center justify-between border-b-3 border-brand-black px-4 py-3">
                                            {title && (
                                                <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">
                                                    {title}
                                                </h2>
                                            )}
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="text-gray-400 hover:text-brand-black transition"
                                            >
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 overflow-y-auto p-4">
                                            {children}
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
