import { CompanyReportDetail } from '@/presentation/components/report/CompanyReportDetail';
import { adminCompanyReportRoute } from '@/presentation/routes/modules/admin.routes';

export function CompanyReportPage() {
  const { id } = adminCompanyReportRoute.useParams();

  return <CompanyReportDetail companyId={Number(id)} />;
}
