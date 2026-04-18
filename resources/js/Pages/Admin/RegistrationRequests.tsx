import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface RegistrationRequestData {
    id: number;
    email: string;
    status: string;
    approved_by: string | null;
    approved_at: string | null;
    created_at: string;
}

interface PaginatedRequests {
    data: RegistrationRequestData[];
    current_page: number;
    last_page: number;
}

export default function RegistrationRequests({
    requests,
}: {
    requests: PaginatedRequests;
}) {
    const { t } = useTranslation();

    const approve = (id: number) => {
        router.post(route('admin.registration-requests.approve', { registrationRequest: id }));
    };

    const reject = (id: number) => {
        router.post(route('admin.registration-requests.reject', { registrationRequest: id }));
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('admin.registrationRequests')} />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-2xl font-black uppercase tracking-tight">
                    {t('admin.registrationRequests')}
                </h1>

                <div className="overflow-hidden border-3 border-brand-black bg-white shadow-brutal">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-brand-black text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                    {t('auth.email')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                    {t('admin.status')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                    {t('admin.requestedAt')}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider">
                                    {t('admin.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                        {t('admin.noRequests')}
                                    </td>
                                </tr>
                            )}
                            {requests.data.map((req) => (
                                <tr key={req.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                        {req.email}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColor(req.status)}`}>
                                            {t(`admin.status_${req.status}`)}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                        {req.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <PrimaryButton onClick={() => approve(req.id)}>
                                                    {t('admin.approve')}
                                                </PrimaryButton>
                                                <button
                                                    onClick={() => reject(req.id)}
                                                    className="rounded border-2 border-red-600 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white"
                                                >
                                                    {t('admin.reject')}
                                                </button>
                                            </div>
                                        )}
                                        {req.status === 'approved' && req.approved_by && (
                                            <span className="text-xs text-gray-400">
                                                {t('admin.approvedBy', { name: req.approved_by })}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
