import React from 'react';
import DebtSummaryCards from './DebtSummaryCards';
import DebtTopLists from './DebtTopLists';
import PartnerDebtTable from './PartnerDebtTable';
import PartnerLedgerView from './PartnerLedgerView';
import type { Partner, LedgerReport } from '../../types';

interface Props {
  partners: Partner[];
  selectedPartnerId: number | '';
  setSelectedPartnerId: (id: number | '') => void;
  selectedPartnerObj: Partner | undefined;
  startDate: string; setStartDate: (v: string) => void;
  endDate: string; setEndDate: (v: string) => void;
  partnerSearchQuery: string; setPartnerSearchQuery: (v: string) => void;
  totalReceivables: number;
  totalPayables: number;
  topDebtors: Partner[];
  topCreditors: Partner[];
  filteredPartnersList: Partner[];
  ledgerReport: LedgerReport;
  handlePrint: () => void;
}

export default function DebtReportTab(props: Props) {
  const {
    selectedPartnerId, setSelectedPartnerId, selectedPartnerObj,
    startDate, setStartDate, endDate, setEndDate,
    partnerSearchQuery, setPartnerSearchQuery,
    totalReceivables, totalPayables,
    topDebtors, topCreditors,
    filteredPartnersList, ledgerReport, handlePrint,
  } = props;

  if (selectedPartnerId && selectedPartnerObj) {
    return (
      <PartnerLedgerView
        partner={selectedPartnerObj}
        ledgerReport={ledgerReport}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        onBack={() => setSelectedPartnerId('')}
        onPrint={handlePrint}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DebtSummaryCards totalReceivables={totalReceivables} totalPayables={totalPayables} />
      <DebtTopLists
        topDebtors={topDebtors}
        topCreditors={topCreditors}
        totalReceivables={totalReceivables}
        totalPayables={totalPayables}
      />
      <PartnerDebtTable
        partners={filteredPartnersList}
        searchQuery={partnerSearchQuery}
        setSearchQuery={setPartnerSearchQuery}
        onSelectPartner={(id) => setSelectedPartnerId(id)}
      />
    </div>
  );
}
