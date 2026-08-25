'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  User, 
  ArrowRight, 
  Trash2, 
  Edit, 
  FolderKanban,
  FileSpreadsheet,
  X,
  Check,
  List,
  LayoutGrid,
  ArrowUpDown,
  MapPin,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { CompanyType } from '@/types/estimate';
import { formatCurrency } from '@/lib/calculator';
import { formatDate } from '@/lib/utils';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 뷰 모드 및 정렬 상태 (기본값: 리스트형, 최신 등록일순)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'>('date-desc');

  // 등록/수정 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyType | null>(null);

  const [formName, setFormName] = useState('');
  const [formBizNum, setFormBizNum] = useState('');
  const [formCeo, setFormCeo] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formContactEmail, setFormContactEmail] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      setCompanies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const openCreateModal = () => {
    setEditingCompany(null);
    setFormName('');
    setFormBizNum('');
    setFormCeo('');
    setFormAddress('');
    setFormContactPerson('');
    setFormContactEmail('');
    setFormContactPhone('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: CompanyType) => {
    setEditingCompany(c);
    setFormName(c.name);
    setFormBizNum(c.businessNumber || '');
    setFormCeo(c.ceoName || '');
    setFormAddress(c.address || '');
    setFormContactPerson(c.contactPerson || '');
    setFormContactEmail(c.contactEmail || '');
    setFormContactPhone(c.contactPhone || '');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formName,
        businessNumber: formBizNum,
        ceoName: formCeo,
        address: formAddress,
        contactPerson: formContactPerson,
        contactEmail: formContactEmail,
        contactPhone: formContactPhone,
      };

      let res;
      if (editingCompany) {
        res = await fetch(`/api/companies/${editingCompany.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        fetchCompanies();
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`고객사 [${name}]를 삭제하시겠습니까? 연결된 모든 프로젝트와 견적서가 함께 삭제됩니다.`)) return;

    try {
      const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCompanies(companies.filter((c) => c.id !== id));
      } else {
        alert('삭제 실패');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 검색 및 날짜순/이름순 정렬 로직
  const sortedAndFilteredCompanies = [...companies]
    .filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.ceoName && c.ceoName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.businessNumber && c.businessNumber.includes(searchTerm)) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name, 'ko');
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name, 'ko');
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">고객사(거래처) 관리</h1>
          <p className="text-sm text-slate-500 mt-1">
            고객사별 프로젝트 및 견적 히스토리를 체계적으로 관리합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          신규 고객사 등록
        </button>
      </div>

      {/* Search, Sort & View Mode Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="고객사명, 대표자, 담당자, 사업자번호 검색..."
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
              <option value="name-asc">🔤 고객사명 가나다순 (A-Z)</option>
              <option value="name-desc">🔤 고객사명 역순 (Z-A)</option>
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
      ) : sortedAndFilteredCompanies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3 shadow-sm">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">등록된 고객사가 없습니다.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> 첫 고객사 등록하기
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* 1. 리스트형 테이블 뷰 (Default) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="w-full overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                <tr>
                  <th className="py-3 px-4">고객사(법인)명</th>
                  <th className="py-3 px-3">사업자등록번호</th>
                  <th className="py-3 px-3">대표자 / 담당자</th>
                  <th className="py-3 px-3">대표 연락처 / 이메일</th>
                  <th className="py-3 px-3 text-center">진행 프로젝트</th>
                  <th className="py-3 px-3 text-right">누적 견적 금액</th>
                  <th className="py-3 px-3 text-center">등록일자</th>
                  <th className="py-3 px-4 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedAndFilteredCompanies.map((comp) => {
                  const projectCount = comp.projects?.length || 0;
                  const estimateList = comp.projects?.flatMap((p: any) => p.estimates || []) || [];
                  const totalEstimateAmount = estimateList.reduce(
                    (acc: number, cur: any) => acc + (cur.grandTotal || 0),
                    0
                  );

                  return (
                    <tr
                      key={comp.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/companies/${comp.id}`}
                          className="font-bold text-slate-900 text-sm hover:text-blue-600 flex items-center gap-2 group-hover:underline"
                        >
                          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <span>{comp.name}</span>
                        </Link>
                        {comp.address && (
                          <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            {comp.address}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {comp.businessNumber || '-'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {comp.contactPerson || '-'}
                        </div>
                        {comp.ceoName && (
                          <div className="text-[11px] text-slate-400">
                            대표: {comp.ceoName}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {comp.contactPhone && (
                          <div className="font-mono text-[11px] text-slate-700">
                            {comp.contactPhone}
                          </div>
                        )}
                        {comp.contactEmail && (
                          <div className="text-[11px] text-blue-600 font-mono">
                            {comp.contactEmail}
                          </div>
                        )}
                        {!comp.contactPhone && !comp.contactEmail && (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {projectCount}개 사업
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                        {totalEstimateAmount > 0 ? (
                          `₩${formatCurrency(totalEstimateAmount)}`
                        ) : (
                          <span className="text-slate-400 font-normal text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-400 text-[11px] font-mono">
                        {comp.createdAt ? formatDate(comp.createdAt) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/companies/${comp.id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="상세보기"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditModal(comp)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="수정"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(comp.id, comp.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
          {sortedAndFilteredCompanies.map((comp) => {
            const projectCount = comp.projects?.length || 0;
            const estimateList = comp.projects?.flatMap((p: any) => p.estimates || []) || [];
            const totalEstimateAmount = estimateList.reduce((acc: number, cur: any) => acc + (cur.grandTotal || 0), 0);

            return (
              <div
                key={comp.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{comp.name}</h3>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {comp.businessNumber ? `사업자번호: ${comp.businessNumber}` : '사업자번호 미등록'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(comp)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(comp.id, comp.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 담당자 정보 */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{comp.contactPerson || '담당자 미지정'}</span>
                      {comp.ceoName && <span className="text-[11px] text-slate-400">(대표: {comp.ceoName})</span>}
                    </div>
                    {comp.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">{comp.contactPhone}</span>
                      </div>
                    )}
                    {comp.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-blue-600">{comp.contactEmail}</span>
                      </div>
                    )}
                    {comp.address && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{comp.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 하단 통계 및 이동 */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-[11px] text-slate-400">
                      진행 프로젝트 <span className="font-bold text-slate-800 font-mono">{projectCount}건</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-900">
                      {totalEstimateAmount > 0 ? `₩${formatCurrency(totalEstimateAmount)}` : '견적 없음'}
                    </div>
                  </div>
                  <Link
                    href={`/companies/${comp.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    상세보기 <ArrowRight className="w-3.5 h-3.5" />
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingCompany ? '고객사 정보 수정' : '신규 고객사 등록'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  고객사(회사명) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="예: (주)한국글로벌파이낸스"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    사업자등록번호
                  </label>
                  <input
                    type="text"
                    value={formBizNum}
                    onChange={(e) => setFormBizNum(e.target.value)}
                    placeholder="123-45-67890"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    대표자명
                  </label>
                  <input
                    type="text"
                    value={formCeo}
                    onChange={(e) => setFormCeo(e.target.value)}
                    placeholder="홍길동"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  사업장 주소
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="서울특별시 영등포구 여의대로 56"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    담당자명
                  </label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    placeholder="김팀장"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    연락처
                  </label>
                  <input
                    type="text"
                    value={formContactPhone}
                    onChange={(e) => setFormContactPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={formContactEmail}
                    onChange={(e) => setFormContactEmail(e.target.value)}
                    placeholder="user@co.kr"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? '저장 중...' : editingCompany ? '수정 완료' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
