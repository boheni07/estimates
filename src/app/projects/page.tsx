'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Building2, 
  Calendar, 
  ArrowRight, 
  Trash2, 
  Edit, 
  FileSpreadsheet,
  X,
  User,
  Phone,
  Mail,
  ArrowUpDown,
  List,
  LayoutGrid,
  ExternalLink
} from 'lucide-react';
import { ProjectType, CompanyType } from '@/types/estimate';
import { formatCurrency } from '@/lib/calculator';
import { formatDate } from '@/lib/utils';

// ProjectsPage Content with List & Grid View, Date & Name Sorting
function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 뷰 모드 및 정렬 상태 (기본값: 리스트형, 등록일 최신순)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'>('date-desc');

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectType | null>(null);

  const [formCompanyId, setFormCompanyId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('IN_PROGRESS');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formClientDept, setFormClientDept] = useState('');
  const [formClientManager, setFormClientManager] = useState('');
  const [formClientPosition, setFormClientPosition] = useState('');
  const [formClientPhone, setFormClientPhone] = useState('');
  const [formClientEmail, setFormClientEmail] = useState('');
  const [contactSourceInfo, setContactSourceInfo] = useState<{
    type: 'PROJECT' | 'COMPANY';
    name: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/companies')
      ]);
      const pData: ProjectType[] = await pRes.json();
      const cData: CompanyType[] = await cRes.json();
      setProjects(pData);
      setCompanies(cData);

      const urlCompanyId = searchParams.get('companyId');
      const urlAction = searchParams.get('action');

      if (urlCompanyId && urlAction === 'new') {
        setEditingProject(null);
        setFormCompanyId(urlCompanyId);
        setFormTitle('');
        setFormDesc('');
        setFormStatus('IN_PROGRESS');
        setFormStartDate('');
        setFormEndDate('');
        applyDefaultContactInfo(urlCompanyId, undefined, pData, cData);
        setIsModalOpen(true);
      } else if (cData.length > 0 && !formCompanyId) {
        setFormCompanyId(cData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  // 담당자 연락망 기본값 자동 적용 (기존 프로젝트 우선 -> 없으면 고객사 정보)
  const applyDefaultContactInfo = (
    companyId: string,
    specificProjectId?: string,
    overrideProjectsList?: ProjectType[],
    overrideCompaniesList?: CompanyType[]
  ) => {
    const pList = overrideProjectsList || projects;
    const cList = overrideCompaniesList || companies;

    const companyProjects = pList.filter((p) => p.companyId === companyId);
    const targetCompany = cList.find((c) => c.id === companyId);

    if (specificProjectId) {
      const selProj = companyProjects.find((p) => p.id === specificProjectId);
      if (selProj) {
        setFormClientDept(selProj.clientDept || '');
        setFormClientManager(selProj.clientManager || '');
        setFormClientPosition(selProj.clientPosition || '');
        setFormClientPhone(selProj.clientPhone || '');
        setFormClientEmail(selProj.clientEmail || '');
        setContactSourceInfo({ type: 'PROJECT', name: selProj.title });
        return;
      }
    }

    if (companyProjects.length > 0) {
      // 1. 기존 프로젝트가 있는 경우: 가장 최근 프로젝트 정보 자동 로드
      const lastProj = companyProjects[companyProjects.length - 1];
      setFormClientDept(lastProj.clientDept || '');
      setFormClientManager(lastProj.clientManager || '');
      setFormClientPosition(lastProj.clientPosition || '');
      setFormClientPhone(lastProj.clientPhone || '');
      setFormClientEmail(lastProj.clientEmail || '');
      setContactSourceInfo({ type: 'PROJECT', name: lastProj.title });
    } else if (targetCompany) {
      // 2. 기존 프로젝트가 없는 경우: 고객사 기본 정보 자동 로드
      setFormClientDept('');
      setFormClientManager(targetCompany.contactPerson || targetCompany.ceoName || '');
      setFormClientPosition(
        targetCompany.contactPerson ? '담당자' : targetCompany.ceoName ? '대표' : ''
      );
      setFormClientPhone(targetCompany.contactPhone || '');
      setFormClientEmail(targetCompany.contactEmail || '');
      setContactSourceInfo({ type: 'COMPANY', name: targetCompany.name });
    } else {
      setContactSourceInfo(null);
    }
  };

  const handleCompanyChange = (newCompanyId: string) => {
    setFormCompanyId(newCompanyId);
    if (!editingProject) {
      applyDefaultContactInfo(newCompanyId);
    }
  };

  const openCreateModal = (initialCompanyId?: string) => {
    setEditingProject(null);
    const compId = initialCompanyId || (companies.length > 0 ? companies[0].id : '');
    setFormCompanyId(compId);
    setFormTitle('');
    setFormDesc('');
    setFormStatus('IN_PROGRESS');
    setFormStartDate('');
    setFormEndDate('');

    if (compId) {
      applyDefaultContactInfo(compId);
    } else {
      setFormClientDept('');
      setFormClientManager('');
      setFormClientPosition('');
      setFormClientPhone('');
      setFormClientEmail('');
      setContactSourceInfo(null);
    }
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProjectType) => {
    setEditingProject(p);
    setFormCompanyId(p.companyId);
    setFormTitle(p.title);
    setFormDesc(p.description || '');
    setFormStatus(p.status);
    setFormStartDate(p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '');
    setFormEndDate(p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : '');
    setFormClientDept(p.clientDept || '');
    setFormClientManager(p.clientManager || '');
    setFormClientPosition(p.clientPosition || '');
    setFormClientPhone(p.clientPhone || '');
    setFormClientEmail(p.clientEmail || '');
    setContactSourceInfo(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        companyId: formCompanyId,
        title: formTitle,
        description: formDesc,
        status: formStatus,
        startDate: formStartDate || null,
        endDate: formEndDate || null,
        clientDept: formClientDept,
        clientManager: formClientManager,
        clientPosition: formClientPosition,
        clientPhone: formClientPhone,
        clientEmail: formClientEmail,
      };

      let res;
      if (editingProject) {
        res = await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`프로젝트 [${title}]를 삭제하시겠습니까? 연결된 견적서가 함께 삭제됩니다.`)) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
      } else {
        alert('삭제 실패');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 검색 및 날짜순/이름순 정렬 로직
  const sortedAndFilteredProjects = [...projects]
    .filter((p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.company?.name && p.company.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.clientManager && p.clientManager.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.clientDept && p.clientDept.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'name-asc') {
        return a.title.localeCompare(b.title, 'ko');
      }
      if (sortBy === 'name-desc') {
        return b.title.localeCompare(a.title, 'ko');
      }
      return 0;
    });

  const getStatusBadgeUI = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            진행중
          </span>
        );
      case 'PLANNING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            기획/제안
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            완료
          </span>
        );
      case 'ON_HOLD':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            보류
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">프로젝트 관리</h1>
          <p className="text-sm text-slate-500 mt-1">
            사업별 진행 상태와 견적서 버전 히스토리를 관리합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openCreateModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          신규 프로젝트 등록
        </button>
      </div>

      {/* Search, Sort & View Mode Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="프로젝트명, 고객사명, 담당자명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Sort & View Mode Toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* 정렬 드롭다운 (날짜순 / 이름순) */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-500 text-[11px]">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="date-desc">📅 등록일 최신순</option>
              <option value="date-asc">📅 등록일 오래된순</option>
              <option value="name-asc">🔤 프로젝트명 가나다순 (A-Z)</option>
              <option value="name-desc">🔤 프로젝트명 역순 (Z-A)</option>
            </select>
          </div>

          {/* 뷰 모드 토글 (리스트형 기본) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="리스트형 테이블 뷰"
            >
              <List className="w-3.5 h-3.5" />
              <span>리스트형</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="카드형 그리드 뷰"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>카드형</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content (List / Grid View) */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : sortedAndFilteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3 shadow-sm">
          <FolderKanban className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">등록된 프로젝트가 없습니다.</p>
          <button
            type="button"
            onClick={() => openCreateModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> 첫 프로젝트 등록하기
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* 1. 리스트형 테이블 뷰 (Default - 2줄 통합 레이아웃) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="w-full overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                <tr>
                  <th className="py-3 px-3 text-center w-20 whitespace-nowrap">상태</th>
                  <th className="py-3 px-3.5 min-w-[260px]">프로젝트(사업)명 / 고객사(발주처)</th>
                  <th className="py-3 px-3.5 min-w-[200px]">발주처 전담 담당자</th>
                  <th className="py-3 px-3.5 w-36 whitespace-nowrap">사업 기간</th>
                  <th className="py-3 px-3.5 text-right w-36 whitespace-nowrap">견적 현황</th>
                  <th className="py-3 px-3 text-center w-28 whitespace-nowrap">등록일자</th>
                  <th className="py-3 px-3.5 text-center w-28 whitespace-nowrap">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedAndFilteredProjects.map((p) => {
                  const estimates = p.estimates || [];
                  const latestEstimate = estimates[0];

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* 상태 배지 */}
                      <td className="py-3 px-3 text-center align-middle whitespace-nowrap">
                        {getStatusBadgeUI(p.status)}
                      </td>

                      {/* 1. 프로젝트(사업)명 - 1줄 / 고객사(발주처) - 2줄 */}
                      <td className="py-3 px-3.5 align-middle">
                        {/* 1줄: 프로젝트(사업)명 */}
                        <div className="mb-1">
                          <Link
                            href={`/projects/${p.id}`}
                            className="font-bold text-slate-900 text-xs hover:text-blue-600 flex items-center gap-1.5 transition-colors line-clamp-1 group-hover:underline"
                            title={p.title}
                          >
                            <div className="p-1 bg-blue-50 text-blue-600 rounded shrink-0">
                              <FolderKanban className="w-3.5 h-3.5" />
                            </div>
                            <span>{p.title}</span>
                          </Link>
                        </div>
                        {/* 2줄: 고객사(발주처) 및 개요 */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 flex-wrap">
                          <div className="font-semibold text-slate-800 flex items-center gap-1 shrink-0">
                            <Building2 className="w-3 h-3 text-blue-600" />
                            <span>{p.company?.name || '고객사 미지정'}</span>
                          </div>
                          {p.description && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span className="text-slate-500 truncate max-w-xs" title={p.description}>
                                {p.description}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* 2. 발주처 전담 담당자 (1줄: 부서/성명/직책, 2줄: 연락처/이메일) */}
                      <td className="py-3 px-3.5 align-middle">
                        <div className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {p.clientDept ? `[${p.clientDept}] ` : ''}
                            {p.clientManager || '담당자 미지정'} {p.clientPosition || ''}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 font-mono flex-wrap">
                          {p.clientPhone && (
                            <span className="flex items-center gap-0.5">
                              <Phone className="w-2.5 h-2.5 text-slate-400" />
                              <span>{p.clientPhone}</span>
                            </span>
                          )}
                          {p.clientEmail && (
                            <span className="flex items-center gap-0.5 text-blue-600">
                              <Mail className="w-2.5 h-2.5 text-blue-400" />
                              <span className="truncate max-w-[120px]">{p.clientEmail}</span>
                            </span>
                          )}
                          {!p.clientPhone && !p.clientEmail && (
                            <span className="text-slate-400 text-[10px] font-sans">연락처 미등록</span>
                          )}
                        </div>
                      </td>

                      {/* 3. 사업기간 (1줄: 시작일자 ~, 2줄: 종료일자) */}
                      <td className="py-3 px-3.5 align-middle font-mono text-[11px] whitespace-nowrap">
                        {p.startDate || p.endDate ? (
                          <div className="space-y-0.5">
                            <div className="text-slate-700 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>시작: {p.startDate ? formatDate(p.startDate) : '미정'} ~</span>
                            </div>
                            <div className="text-slate-500 pl-4">
                              <span>종료: {p.endDate ? formatDate(p.endDate) : '미정'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">기간 미정</span>
                        )}
                      </td>

                      {/* 4. 견적 현황 (1줄: 최신 합계액, 2줄: 발행 건수) */}
                      <td className="py-3 px-3.5 text-right align-middle whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {latestEstimate ? (
                            `₩${formatCurrency(latestEstimate.grandTotal)}`
                          ) : (
                            <span className="text-slate-400 font-normal">-</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                            견적 {estimates.length}건
                          </span>
                        </div>
                      </td>

                      {/* 5. 등록일자 */}
                      <td className="py-3 px-3 text-center text-slate-400 text-[11px] font-mono align-middle whitespace-nowrap">
                        {p.createdAt ? formatDate(p.createdAt) : '-'}
                      </td>

                      {/* 6. 관리 버튼 */}
                      <td className="py-3 px-3.5 text-center align-middle whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/projects/${p.id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="상세 및 견적 히스토리"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="수정"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 2. 카드형 그리드 뷰 (Grid View) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedAndFilteredProjects.map((p) => {
            const estimates = p.estimates || [];
            const latestEstimate = estimates[0];

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    {getStatusBadgeUI(p.status)}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mt-2 line-clamp-1">{p.title}</h3>
                  <div className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {p.company?.name || '고객사 미지정'}
                  </div>

                  {/* 프로젝트별 발주처 담당자 정보 배너 */}
                  {(p.clientManager || p.clientDept || p.clientEmail) && (
                    <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-[11px] text-slate-600">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-blue-600" />
                        <span>{p.clientDept ? `[${p.clientDept}] ` : ''}{p.clientManager || '담당자 미기재'} {p.clientPosition || ''}</span>
                      </div>
                      {p.clientPhone && (
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{p.clientPhone}</span>
                        </div>
                      )}
                      {p.clientEmail && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{p.clientEmail}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {p.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}

                  <div className="mt-3 text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {p.startDate ? `${formatDate(p.startDate)} ~ ${formatDate(p.endDate)}` : '기간 미정'}
                  </div>
                </div>

                {/* Bottom Estimates summary */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400 text-[11px]">견적 버전 ({estimates.length}건)</span>
                    {latestEstimate && (
                      <div className="font-mono font-bold text-slate-900 mt-0.5">
                        최신 ₩{formatCurrency(latestEstimate.grandTotal)}
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/projects/${p.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    상세 및 버전 <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 등록/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingProject ? '프로젝트 정보 수정' : '신규 프로젝트 등록'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  고객사(발주처) 선택 <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formCompanyId}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  required
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  프로젝트명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="예: 2026년 차세대 시스템 구축"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              {/* 프로젝트별 고객사 담당자 정보 그룹 (기존 프로젝트/고객사 정보 자동 로드) */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-200/80 pb-2 flex-wrap gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>프로젝트별 발주처(고객사) 담당자 연락망</span>
                  </div>
                  
                  {/* 기존 프로젝트가 2개 이상일 때 다른 프로젝트 담당자 선택 옵션 */}
                  {!editingProject && projects.filter((p) => p.companyId === formCompanyId).length > 1 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          applyDefaultContactInfo(formCompanyId, e.target.value);
                        }
                      }}
                      className="text-[10px] bg-white border border-blue-300 text-blue-800 rounded px-2 py-0.5 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      defaultValue=""
                    >
                      <option value="" disabled>다른 기존 프로젝트 연락망 가져오기 ▾</option>
                      {projects
                        .filter((p) => p.companyId === formCompanyId)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} ({p.clientManager || '담당자미기재'})
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                {/* 자동 로드 안내 배지 */}
                {contactSourceInfo && !editingProject && (
                  <div className="bg-white/80 border border-blue-200 rounded-lg px-2.5 py-1 text-[11px] text-blue-800 flex items-center gap-1.5 shadow-sm">
                    <span className="font-bold text-blue-600">💡 자동 입력 안내:</span>
                    <span>
                      {contactSourceInfo.type === 'PROJECT'
                        ? `기존 프로젝트 [${contactSourceInfo.name}]의 담당자 연락망을 기본값으로 불러왔습니다. (수정 가능)`
                        : `기존 프로젝트가 없어 고객사 [${contactSourceInfo.name}]의 기본 연락처를 불러왔습니다. (수정 가능)`}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      담당 부서
                    </label>
                    <input
                      type="text"
                      value={formClientDept}
                      onChange={(e) => setFormClientDept(e.target.value)}
                      placeholder="예: 디지털혁신팀, IT기획부"
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      담당자명 / 직책
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={formClientManager}
                        onChange={(e) => setFormClientManager(e.target.value)}
                        placeholder="홍길동"
                        className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                      />
                      <input
                        type="text"
                        value={formClientPosition}
                        onChange={(e) => setFormClientPosition(e.target.value)}
                        placeholder="팀장/수석"
                        className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      담당자 연락처
                    </label>
                    <input
                      type="text"
                      value={formClientPhone}
                      onChange={(e) => setFormClientPhone(e.target.value)}
                      placeholder="010-1234-5678"
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      담당자 이메일
                    </label>
                    <input
                      type="email"
                      value={formClientEmail}
                      onChange={(e) => setFormClientEmail(e.target.value)}
                      placeholder="manager@company.com"
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  프로젝트 설명
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={2}
                  placeholder="사업 범위 및 주요 개요"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    시작일자
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    종료일자
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  진행 상태
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                >
                  <option value="PLANNING">기획 및 제안 (PLANNING)</option>
                  <option value="IN_PROGRESS">진행중 (IN_PROGRESS)</option>
                  <option value="COMPLETED">완료 (COMPLETED)</option>
                  <option value="ON_HOLD">보류 (ON_HOLD)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? '저장 중...' : editingProject ? '수정 완료' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ProjectsPageContent />
    </Suspense>
  );
}
