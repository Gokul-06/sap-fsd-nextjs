/**
 * SAP FI (Financial Accounting) Reference Data
 * Tables, Transactions, Fiori Apps, CDS Views, BAPIs, and Integration Points
 */

export const FI_TABLES = {
  generalLedger: {
    BKPF: "Accounting Document Header",
    BSEG: "Accounting Document Segment",
    SKA1: "GL Account Master (Chart of Accounts)",
    SKB1: "GL Account Master (Company Code)",
    SKAT: "GL Account Master Record (Texts)",
    FAGLFLEXT: "New GL – Totals Table",
    ACDOCA: "Universal Journal Entry Line Items",
    T001: "Company Codes",
  },
  accountsPayable: {
    BSIK: "Vendor Open Items",
    BSAK: "Vendor Cleared Items",
    LFA1: "Vendor Master – General Data",
    LFB1: "Vendor Master – Company Code Data",
    REGUH: "Settlement Data from Payment Program (Header)",
    REGUP: "Processed Items from Payment Program",
  },
  accountsReceivable: {
    BSID: "Customer Open Items",
    BSAD: "Customer Cleared Items",
    KNA1: "Customer Master – General Data",
    KNB1: "Customer Master – Company Code Data",
  },
  assetAccounting: {
    ANLA: "Asset Master Record – General Data",
    ANLB: "Depreciation Terms",
    ANLC: "Asset Value Fields",
    ANLP: "Asset Periodic Values",
    TABWA: "Asset Transaction Types",
  },
  bankAccounting: {
    T012: "House Banks",
    T012K: "House Bank Accounts",
    BNKA: "Bank Master Data",
    FEBEP: "Electronic Bank Statement Line Items",
  },
  taxAccounting: {
    BSET: "Tax Data Document Segment",
    T007A: "Tax Keys",
    T059Z: "Withholding Tax – Rates",
  },
};

export const FI_TCODES = {
  documentPosting: {
    FB01: "Post Document",
    FB50: "Post GL Account Document",
    "F-02": "Post General Ledger Document",
    "F-04": "Post Clearing",
    FB05: "Post with Clearing",
    FBS1: "Enter Accrual/Deferral Document",
    FBR2: "Post Recurring Document",
  },
  accountsPayable: {
    FK01: "Create Vendor (Accounting)",
    FK02: "Change Vendor (Accounting)",
    FK03: "Display Vendor (Accounting)",
    "F-43": "Post Vendor Invoice",
    "F-44": "Clear Vendor",
    F110: "Automatic Payment Run",
    FBRA: "Reset Cleared Items",
    MRBR: "Release Blocked Invoices",
  },
  accountsReceivable: {
    FD01: "Create Customer (Accounting)",
    FD02: "Change Customer (Accounting)",
    FD03: "Display Customer (Accounting)",
    "F-28": "Post Incoming Payments",
    "F-32": "Clear Customer",
    F150: "Dunning Run",
    "F-27": "Post Customer Credit Memo",
  },
  assetAccounting: {
    AS01: "Create Asset Master Record",
    AS02: "Change Asset Master Record",
    AS03: "Display Asset Master Record",
    AFAB: "Post Depreciation Run",
    AW01N: "Asset Explorer",
    ABZON: "Asset Acquisition – Automatic Offsetting Entry",
    ABAVN: "Asset Retirement by Scrapping",
  },
  closing: {
    "F.01": "Foreign Currency Valuation – GL",
    "F.05": "Foreign Currency Valuation – Vendor/Customer",
    FAGLB03: "Display GL Account Balances (New GL)",
    S_ALR_87012277: "Recurring Entry Program",
    ASKB: "Post Depreciation Run (Batch)",
    AJAB: "Year-End Closing – Asset Accounting",
  },
  reporting: {
    FBL1N: "Vendor Line Items",
    FBL3N: "GL Account Line Items",
    FBL5N: "Customer Line Items",
    FS10N: "GL Account Balance Display",
    FK10N: "Vendor Account Balance Display",
    FD10N: "Customer Account Balance Display",
    S_ALR_87012078: "Financial Statements – Actual/Actual Comparison",
    S_ALR_87012082: "Balance Sheet / P&L Statement",
  },
  bankAccounting: {
    FF67: "Post Bank Statement (Manual)",
    FF68: "Post Bank Statement (Automatic)",
    FEBA: "Post-Process Electronic Bank Statement",
    FF_5: "Cash Management – Cash Position",
  },
  config: {
    SPRO: "IMG – Customizing",
    OB52: "Open and Close Posting Periods",
    OBY6: "Copy Company Code",
    FBKP: "Maintain Accounting Configuration",
    OBA7: "Maintain Document Types",
  },
};

export const FI_FIORI_APPS = {
  generalLedger: {
    F0996: "Post Journal Entries",
    F2217: "Display Journal Entries",
    F1603: "Manage Journal Entries",
  },
  accountsPayable: {
    F0859: "Process Supplier Invoices",
    F1297: "Schedule Supplier Payments",
    F0711: "Manage Supplier Line Items",
  },
  accountsReceivable: {
    F1587: "Process Customer Payments",
    F1071: "Manage Customer Line Items",
    F1439: "Customer Invoice List",
  },
  assetAccounting: {
    F2459: "Manage Fixed Assets",
    F3874: "Post Asset Acquisition",
  },
  analytics: {
    F0708: "Cash Flow Analyzer",
    F1432: "Financial Statement",
    F1155: "Accounts Payable Overview",
  },
};

export const FI_CDS_VIEWS = {
  generalLedger: {
    I_JournalEntry: "Journal Entry Header",
    I_GLAccountLineItem: "GL Account Line Item",
    I_GLAccountBalanceCube: "GL Account Balance Cube",
    I_OperationalAcctgDocItem: "Operational Accounting Document Item",
  },
  accountsPayable: {
    I_SupplierLineItem: "Supplier Line Item",
    I_OperationalAcctgDocItemPayable: "Accounting Document Item – Payables",
  },
  accountsReceivable: {
    I_CustomerLineItem: "Customer Line Item",
    I_OperationalAcctgDocItemReceivable: "Accounting Document Item – Receivables",
  },
  masterData: {
    I_GLAccountInChartOfAccounts: "GL Account in Chart of Accounts",
    I_Supplier: "Supplier Master",
    I_Customer: "Customer Master",
    I_CompanyCode: "Company Code",
  },
};

export const FI_BAPIS = {
  documentPosting: {
    BAPI_ACC_DOCUMENT_POST: "Post Accounting Document",
    BAPI_ACC_DOCUMENT_REV_POST: "Reverse Accounting Document",
    BAPI_ACC_DOCUMENT_CHECK: "Check Accounting Document",
  },
  accountsPayable: {
    BAPI_AP_ACC_GETKEYDATEBALANCE: "Get Vendor Key Date Balance",
    BAPI_VENDOR_GETDETAIL: "Get Vendor Master Details",
  },
  accountsReceivable: {
    BAPI_AR_ACC_GETKEYDATEBALANCE: "Get Customer Key Date Balance",
    BAPI_CUSTOMER_GETDETAIL: "Get Customer Master Details",
  },
  assetAccounting: {
    BAPI_FIXEDASSET_CREATE: "Create Fixed Asset Master",
    BAPI_FIXEDASSET_GETDETAIL: "Get Fixed Asset Details",
  },
};

export const FI_INTEGRATION_POINTS = {
  MM: {
    description: "Materials Management Integration",
    touchpoints: [
      "Invoice Verification (MIRO) → FI Accounting Document posting",
      "Goods Receipt → Accounting Document creation (GR/IR clearing account)",
      "GR/IR clearing account reconciliation",
      "Material valuation changes → GL updates",
      "Automatic account determination via movement types",
      "Vendor master data shared between MM and FI-AP",
    ],
    tables: ["RBKP", "RSEG", "EKBE", "BSEG", "BKPF"],
  },
  SD: {
    description: "Sales & Distribution Integration",
    touchpoints: [
      "Billing document → Revenue posting in FI",
      "Credit management checks fed by AR open items",
      "Customer master shared between SD and FI-AR",
      "Cash discount and payment terms from billing",
      "Intercompany billing and revenue recognition",
    ],
    tables: ["VBRK", "VBRP", "BSID", "BSAD", "KNB1"],
  },
  CO: {
    description: "Controlling Integration",
    touchpoints: [
      "Real-time FI-CO document integration (New GL)",
      "Cost element accounting – primary and secondary cost elements",
      "Document splitting for profit center reporting",
      "Reconciliation ledger (classic) / Real-time integration (New GL)",
      "Assessment and distribution cycles affecting FI postings",
      "Internal order settlement to fixed assets or GL accounts",
    ],
    tables: ["COBK", "COEP", "COSS", "COSP", "ACDOCA"],
  },
  AA: {
    description: "Asset Accounting Integration",
    touchpoints: [
      "Asset acquisition → GL posting (debit asset, credit vendor/clearing)",
      "Depreciation run (AFAB) → GL depreciation expense posting",
      "Asset retirement → GL posting (loss/gain on disposal)",
      "Asset transfer → Intercompany GL postings",
      "Asset revaluation → GL adjustment entries",
      "Year-end closing – asset balances to GL reconciliation",
    ],
    tables: ["ANLA", "ANLC", "ANLP", "BSEG", "BKPF"],
  },
  HR: {
    description: "Human Resources Integration",
    touchpoints: [
      "Payroll posting → FI accounting documents (wages, taxes, deductions)",
      "Travel expense posting → FI vendor clearing or GL expense",
      "Employee vendor accounts for expense reimbursement",
      "Wage type mapping to GL accounts and cost centers",
      "Benefit provisions and accruals posting",
    ],
    tables: ["BSEG", "BKPF", "PA0001", "REGUH"],
  },
};

export const FI_PROCESS_AREAS = [
  "General Ledger Accounting",
  "Accounts Payable",
  "Accounts Receivable",
  "Asset Accounting",
  "Bank Accounting",
  "Tax Accounting",
  "Financial Closing",
  "Financial Reporting",
  "Payment Processing",
  "Dunning",
  "Cash Management",
  "Intercompany Accounting",
  "New GL Accounting",
  "Parallel Valuation",
];

export const FI_CONFIG_AREAS = [
  "Company code settings",
  "Chart of accounts",
  "Fiscal year variant",
  "Posting period variant",
  "Document types",
  "Number ranges",
  "Field status groups",
  "Tolerance groups",
  "Payment terms",
  "Tax configuration",
  "Automatic account determination",
  "Dunning procedure",
  "Payment program (F110)",
  "House bank",
  "Depreciation areas",
];
