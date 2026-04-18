import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Login({
    status,
    canResetPassword,
    registrationSuccess,
}: {
    status?: string;
    canResetPassword: boolean;
    registrationSuccess?: boolean;
}) {
    const { t } = useTranslation();
    const [showRegister, setShowRegister] = useState(false);

    const loginForm = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const registerForm = useForm({
        register_email: '',
    });

    const submitLogin: FormEventHandler = (e) => {
        e.preventDefault();
        loginForm.post(route('login'), {
            onFinish: () => loginForm.reset('password'),
        });
    };

    const submitRegister: FormEventHandler = (e) => {
        e.preventDefault();
        registerForm.post(route('registration-request.store'), {
            onSuccess: () => {
                registerForm.reset();
            },
        });
    };

    return (
        <GuestLayout>
            <Head title={showRegister ? t('auth.register') : t('auth.login')} />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            {registrationSuccess && (
                <div className="mb-4 border-2 border-green-500 bg-green-50 p-3 text-sm font-medium text-green-700">
                    {t('auth.registrationSubmitted')}
                </div>
            )}

            {!showRegister ? (
                <>
                    <form onSubmit={submitLogin}>
                        <div>
                            <InputLabel htmlFor="email" value={t('auth.email')} />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={loginForm.data.email}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => loginForm.setData('email', e.target.value)}
                            />
                            <InputError message={loginForm.errors.email} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="password" value={t('auth.password')} />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={loginForm.data.password}
                                className="mt-1 block w-full"
                                autoComplete="current-password"
                                onChange={(e) => loginForm.setData('password', e.target.value)}
                            />
                            <InputError message={loginForm.errors.password} className="mt-2" />
                        </div>

                        <div className="mt-4 block">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={loginForm.data.remember}
                                    onChange={(e) =>
                                        loginForm.setData(
                                            'remember',
                                            (e.target.checked || false) as false,
                                        )
                                    }
                                />
                                <span className="ms-2 text-sm text-gray-600">
                                    {t('auth.rememberMe')}
                                </span>
                            </label>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setShowRegister(true)}
                                className="text-sm text-gray-600 underline hover:text-gray-900"
                            >
                                {t('auth.requestAccess')}
                            </button>

                            <div className="flex items-center">
                                {canResetPassword && (
                                    <a
                                        href={route('password.request')}
                                        className="text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        {t('auth.forgotPassword')}
                                    </a>
                                )}
                                <PrimaryButton className="ms-4" disabled={loginForm.processing}>
                                    {t('auth.login')}
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </>
            ) : (
                <>
                    <div className="mb-4 text-sm text-gray-600">
                        {t('auth.requestAccessDescription')}
                    </div>

                    <form onSubmit={submitRegister}>
                        <div>
                            <InputLabel htmlFor="register_email" value={t('auth.email')} />
                            <TextInput
                                id="register_email"
                                type="email"
                                name="register_email"
                                value={registerForm.data.register_email}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => registerForm.setData('register_email', e.target.value)}
                            />
                            <InputError message={registerForm.errors.register_email} className="mt-2" />
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setShowRegister(false)}
                                className="text-sm text-gray-600 underline hover:text-gray-900"
                            >
                                {t('auth.backToLogin')}
                            </button>

                            <PrimaryButton disabled={registerForm.processing}>
                                {t('auth.submitRequest')}
                            </PrimaryButton>
                        </div>
                    </form>
                </>
            )}
        </GuestLayout>
    );
}
