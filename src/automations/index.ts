/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Note: This file determines what will be synced to the DAL on deploy.
 * If you have created an automation but for whatever reason are not ready to
 * sync it to the DAL, don't add it here until you're ready.
 */

import { IAutomationHandler } from '../helpers/types'
import addressValidatorHandler from './address-validator/handler'
import appendRowsToGoogleSheetHandler from './append-rows-to-google-sheet/handler'
import autoSnoozeNextStepRun from './auto-snooze-next-step/handler'
import boltRMPExportBatchHandler from './bolt/rmp/export-batch/handler'
import boltRMPScrapingAutomationHandler from './bolt/rmp/scraping-automation/handler'
import boltDVApproveAccountRecipientHandler from './bolt-document-verification/approve-account-recipient/handler'
import boltDVCheckNifHandler from './bolt-document-verification/check-nif/handler'
import boltDVExportHandler from './bolt-document-verification/export/handler'
import boltDVImportNewVerificationHandler from './bolt-document-verification/import-new-verifications/handler'
import boltDVModifyArrayHandler from './bolt-document-verification/modify-array/handler'
import boltDVSetRejectionReasonHandler from './bolt-document-verification/set-rejection-reason/handler'
import bungalowDedupeByAddressHandler from './bungalow/dedupe-by-address/handler'
import bungalowDedupeByPhoneHandler from './bungalow/dedupe-by-phone/handler'
import chunkHandler from './chunk/handler'
import concatenateArraysHandler from './concatenate-arrays/handler'
import copyChildToParentVariablesHandler from './copy-child-to-parent-brv/handler'
import copyParentToChildVariablesHandler from './copy-parent-to-child-brv/handler'
import createGoogleSpreadsheetHandler from './create-google-spreadsheet/handler'
import createTabHandler from './create-tab/handler'
import datassentialExportCollectionHandler from './datassential/export-collections/handler'
import datassentialGenerateCallbackItemsHandler from './datassential/generate-callback-items/handler'
import datassentialImportLegacyItemsHandler from './datassential/import-legacy-items/handler'
import datassentialImportSheetHandler from './datassential/import-sheet/handler'
import datassentialPublishItemsHandler from './datassential/publish-items/handler'
import deduplicateHandler from './deduplicate/handler'
import doordashAITFetchSFDCReportDataHandler from './doordash/ait/fetch-sfdc-report/handler'
import doordashBBOTDCExportSheetHandler from './doordash/bbot/data-collection-export/handler'
import doordashBBOTDCImportSheetHandler from './doordash/bbot/data-collection-import/handler'
import fetchAirtableDesignDataHandler from './doordash/bbot/fetch-airtable-design-data/handler'
import fetchAirtbaleMenusDataHandler from './doordash/bbot/fetch-airtable-menus-data/handler'
import fetchAirtablePrintDataHandler from './doordash/bbot/fetch-airtable-print-data/handler'
import doordashBbotUpdateDesignData from './doordash/bbot/update-design-data/handler'
import doordashBbotUpdateDesignStatus from './doordash/bbot/update-design-status/handler'
import doordashBbotUpdateMenusStatus from './doordash/bbot/update-menu-status/handler'
import doordashBbotUpdateMenusData from './doordash/bbot/update-menus-data/handler'
import doordashBbotUpdatePrintData from './doordash/bbot/update-print-data/handler'
import doordashBbotUpdatePrintStatus from './doordash/bbot/update-print-status/handler'
import doordashCOOFetchSFDCDataHandler from './doordash/coo/fetch-sfdc-data/handler'
import doordashCOOFetchSFDCReportDataHandler from './doordash/coo/fetch-sfdc-report/handler'
import doordashCOOImportDataHandler from './doordash/coo/import-data/handler'
import doordashCOOSaveStepOutcome from './doordash/coo/save-step-outcome/handler'
import doordashISEExportBatch from './doordash/ise/export-batch/handler'
import doordashOSEExportSheetHandler from './doordash/ose/export-batch/handler'
import doordashOSEImportSheetHandler from './doordash/ose/import-sheet/handler'
import doordashOutreachIncementBaseVariableHandler from './doordash/outreach/bv-increment-value/handler'
import doordashOutreachBVSetDateHandler from './doordash/outreach/bv-set-date/handler'
import doordashOutreachExportSheetHandler from './doordash/outreach/export-to-sheets/handler'
import doordashOutreachImportSheetHandler from './doordash/outreach/import-sheet/handler'
import doordashOutreachLogBaseVariableHandler from './doordash/outreach/log-base-variable/handler'
import doordashPIExportBatchHandler from './doordash/pi/export-batch/handler'
import doordashPIImportSheetHandler from './doordash/pi/import-sheet/handler'
import doordashPPRExportSheetHandler from './doordash/ppr/export-batch/handler'
import doordashPPRImportSheetHandler from './doordash/ppr/import-sheet/handler'
import doordashPSExportSheetDataHandler from './doordash/ps/batch-export/handler'
import doordashPSFetchSheetDataHandler from './doordash/ps/fetch-ps-data/handler'
import doordashPUPEnterpriseExportSheetHandler from './doordash/pup-enterprise/export-batch/handler'
import doordashPUPEnterpriseImportSheetHandler from './doordash/pup-enterprise/import-sheet/handler'
import doordashSAMExtractionSheet from './doordash/sam/handler'
import doordashSIEConsolidatedExportBatchHandler from './doordash/sie/consolidated-export/handler'
import doordashSIEExportBatchHandler from './doordash/sie/export-batch/handler'
import doordashSIEImportBatchHandler from './doordash/sie/import-sheet/handler'
import doordashVQAFetchSFDCDataHandler from './doordash/vqa/fetch-sfdc-data/handler'
import duplicateCheckHandler from './duplicate-check/handler'
import duplicateGoogleSheetHandler from './duplicate-google-sheet/handler'
import duplicateGoogleSheetTabHandler from './duplicate-google-sheet-tab/handler'
import duplicateGoogleSheetToClientHandler from './duplicate-google-sheet-to-client/handler'
import ezCarterCreateQASheetHandler from './ezcater/create-qa-sheet/handler'
import filterHandler from './filter/handler'
import filterInHandler from './filter-in/handler'
import flattenHandler from './flatten/handler'
import formatGoogleSheetHandler from './format-google-sheet/handler'
import googleSearchHandler from './google-search/handler'
import groupHandler from './group/handler'
import grubhubAMPImportSheetHandler from './grubhub/amp/import-sheet/handler'
import grubhubFRImportSheetHandler from './grubhub/fr/import-sheet/handler'
import grubhubFRQAImportSheetHandler from './grubhub/frqa/import-sheet/handler'
import grubhubImportUsersHandler from './grubhub/import-users/handler'
import grubhubMUMidStreamImportSheetHandler from './grubhub/mu/import-sheet/handler'
import grubhubMURExportToSFDCDataHandler from './grubhub/mur/export-to-sfdc/handler'
import grubhubMURFetchSFDCDataHandler from './grubhub/mur/fetch-sfdc-data/handler'
import grubhubMUTImportSheetHandler from './grubhub/mut/import-sheet/handler'
import grubhubOperateAutoAssignHandler from './grubhub/operate-auto-assign/handler'
import grubhubPAImportSheetHandler from './grubhub/pa/import-sheet/handler'
import grubhubPCOImportSheetHandler from './grubhub/pco/import-sheet/handler'
import grubhubPUImportSheetHandler from './grubhub/pu/import-sheet/handler'
import grubhubPUTImportSheetHandler from './grubhub/put/import-sheet/handler'
import hotpadsScraperHandler from './hotpads-scraper/handler'
import hunterDomainsHandler from './hunter-domains/handler'
import hunterFinderHandler from './hunter-finder/handler'
import hunterVerifierHandler from './hunter-verifier/handler'
import importCsvToSheetHandler from './import-csv-to-sheet/handler'
import jiraImportHandler from './jira-import/handler'
import joinDataHandler from './join-data/handler'
import klarnaAppendWebsiteHandler from './klarna/append-website-to-final-deliverable-sheet/handler'
import klarnaCreateFinalDeliverableSheetHandler from './klarna/create-final-deliverable-sheet/handler'
import klarnaIdentifyMisalignmentsHandler from './klarna/identify-misalignments/handler'
import klarnaIdentifySpreadsheetTypeHandler from './klarna/identify-spreadsheet-type/handler'
import klarnaModifyArrayHandler from './klarna/modify-array/handler'
import klarnaSetVarsHandler from './klarna/set-vars/handler'
import klarnaSortFinalDeliverableSheetHandler from './klarna/sort-final-deliverable-sheet/handler'
import leadGenHandler from './lead-gen/handler'
import mapFieldsHandler from './map-fields/handler'
import nopHandler from './nop/handler'
import notionUpdatePageHandler from './on-call/create-page-notion/handler'
import GetEgtOnCallHandler from './on-call/get-on-call/handler'
import parseCSVHandler from './parse-csv/handler'
import pickFieldsHandler from './pick-fields/handler'
import rappiPriorityPartnerOrderUpdateHandler from './rappi/priority-partner-calling/update-order-number/handler'
import readGoogleSheetHandler from './read-google-sheet/handler'
import removeEmptyHandler from './remove-empty/handler'
import renameTabHandler from './rename-tab/handler'
import resetZoomMeetingPasswordHandler from './reset-zoom-meeting-password/handler'
import scrapeLinkedinContactsHandler from './scrape-linkedin-contacts/handler'
import sendSlackMessageHandler from './send-slack-message/handler'
import sendSlackMessageViaWebhookHandler from './send-slack-message-via-webhook/handler'
import sortByHandler from './sort-by/handler'
import templateHandler from './template/handler'
import addNumbersHandler from './test/add-numbers/handler'
import addNumbersAsyncHandler from './test/add-numbers-async/handler'
import testFunctionHandler from './test-function/handler'
import testFunctionHandler2 from './test-function-2/handler'
import titleCaseHandler from './title-case/handler'
import trimWhitespaceHandler from './trim-whitespace/handler'
import writeToGoogleSheetHandler from './write-to-google-sheet/handler'
import zillowScraperHandler from './zillow-scraper/handler'

const ALL_HANDLERS: Readonly<{ [k: string]: IAutomationHandler<any, any> }> = {
  [addNumbersAsyncHandler.uid]: addNumbersAsyncHandler,
  [addNumbersHandler.uid]: addNumbersHandler,
  [addressValidatorHandler.uid]: addressValidatorHandler,
  [appendRowsToGoogleSheetHandler.uid]: appendRowsToGoogleSheetHandler,
  [autoSnoozeNextStepRun.uid]: autoSnoozeNextStepRun,
  [chunkHandler.uid]: chunkHandler,
  [concatenateArraysHandler.uid]: concatenateArraysHandler,
  [createGoogleSpreadsheetHandler.uid]: createGoogleSpreadsheetHandler,
  [createTabHandler.uid]: createTabHandler,
  [deduplicateHandler.uid]: deduplicateHandler,
  [bungalowDedupeByAddressHandler.uid]: bungalowDedupeByAddressHandler,
  [bungalowDedupeByPhoneHandler.uid]: bungalowDedupeByPhoneHandler,
  [boltDVApproveAccountRecipientHandler.uid]: boltDVApproveAccountRecipientHandler,
  [boltDVCheckNifHandler.uid]: boltDVCheckNifHandler,
  [boltDVExportHandler.uid]: boltDVExportHandler,
  [boltDVImportNewVerificationHandler.uid]: boltDVImportNewVerificationHandler,
  [boltDVModifyArrayHandler.uid]: boltDVModifyArrayHandler,
  [boltDVSetRejectionReasonHandler.uid]: boltDVSetRejectionReasonHandler,
  [boltRMPExportBatchHandler.uid]: boltRMPExportBatchHandler,
  [boltRMPScrapingAutomationHandler.uid]: boltRMPScrapingAutomationHandler,
  [copyChildToParentVariablesHandler.uid]: copyChildToParentVariablesHandler,
  [copyParentToChildVariablesHandler.uid]: copyParentToChildVariablesHandler,
  [datassentialGenerateCallbackItemsHandler.uid]: datassentialGenerateCallbackItemsHandler,
  [datassentialImportSheetHandler.uid]: datassentialImportSheetHandler,
  [datassentialImportLegacyItemsHandler.uid]: datassentialImportLegacyItemsHandler,
  [datassentialExportCollectionHandler.uid]: datassentialExportCollectionHandler,
  [doordashAITFetchSFDCReportDataHandler.uid]: doordashAITFetchSFDCReportDataHandler,
  [doordashVQAFetchSFDCDataHandler.uid]: doordashVQAFetchSFDCDataHandler,
  [doordashBBOTDCExportSheetHandler.uid]: doordashBBOTDCExportSheetHandler,
  [doordashBBOTDCImportSheetHandler.uid]: doordashBBOTDCImportSheetHandler,
  [doordashCOOFetchSFDCDataHandler.uid]: doordashCOOFetchSFDCDataHandler,
  [doordashCOOFetchSFDCReportDataHandler.uid]: doordashCOOFetchSFDCReportDataHandler,
  [doordashCOOImportDataHandler.uid]: doordashCOOImportDataHandler,
  [doordashCOOSaveStepOutcome.uid]: doordashCOOSaveStepOutcome,
  [doordashISEExportBatch.uid]: doordashISEExportBatch,
  [doordashOutreachImportSheetHandler.uid]: doordashOutreachImportSheetHandler,
  [doordashOutreachExportSheetHandler.uid]: doordashOutreachExportSheetHandler,
  [doordashOutreachBVSetDateHandler.uid]: doordashOutreachBVSetDateHandler,
  [doordashOutreachLogBaseVariableHandler.uid]: doordashOutreachLogBaseVariableHandler,
  [doordashOutreachIncementBaseVariableHandler.uid]: doordashOutreachIncementBaseVariableHandler,
  [doordashPPRImportSheetHandler.uid]: doordashPPRImportSheetHandler,
  [doordashPPRExportSheetHandler.uid]: doordashPPRExportSheetHandler,
  [doordashPSFetchSheetDataHandler.uid]: doordashPSFetchSheetDataHandler,
  [doordashPSExportSheetDataHandler.uid]: doordashPSExportSheetDataHandler,
  [doordashOSEImportSheetHandler.uid]: doordashOSEImportSheetHandler,
  [doordashPUPEnterpriseExportSheetHandler.uid]: doordashPUPEnterpriseExportSheetHandler,
  [doordashPUPEnterpriseImportSheetHandler.uid]: doordashPUPEnterpriseImportSheetHandler,
  [doordashSAMExtractionSheet.uid]: doordashSAMExtractionSheet,
  [doordashOSEExportSheetHandler.uid]: doordashOSEExportSheetHandler,
  [doordashSIEExportBatchHandler.uid]: doordashSIEExportBatchHandler,
  [doordashSIEConsolidatedExportBatchHandler.uid]: doordashSIEConsolidatedExportBatchHandler,
  [doordashSIEImportBatchHandler.uid]: doordashSIEImportBatchHandler,
  [doordashPIImportSheetHandler.uid]: doordashPIImportSheetHandler,
  [doordashPIExportBatchHandler.uid]: doordashPIExportBatchHandler,
  [doordashBbotUpdateDesignData.uid]: doordashBbotUpdateDesignData,
  [doordashBbotUpdateDesignStatus.uid]: doordashBbotUpdateDesignStatus,
  [doordashBbotUpdateMenusData.uid]: doordashBbotUpdateMenusData,
  [doordashBbotUpdateMenusStatus.uid]: doordashBbotUpdateMenusStatus,
  [doordashBbotUpdatePrintData.uid]: doordashBbotUpdatePrintData,
  [doordashBbotUpdatePrintStatus.uid]: doordashBbotUpdatePrintStatus,
  [datassentialPublishItemsHandler.uid]: datassentialPublishItemsHandler,
  [duplicateCheckHandler.uid]: duplicateCheckHandler,
  [duplicateGoogleSheetHandler.uid]: duplicateGoogleSheetHandler,
  [duplicateGoogleSheetTabHandler.uid]: duplicateGoogleSheetTabHandler,
  [duplicateGoogleSheetToClientHandler.uid]: duplicateGoogleSheetToClientHandler,
  [ezCarterCreateQASheetHandler.uid]: ezCarterCreateQASheetHandler,
  [fetchAirtableDesignDataHandler.uid]: fetchAirtableDesignDataHandler,
  [fetchAirtbaleMenusDataHandler.uid]: fetchAirtbaleMenusDataHandler,
  [fetchAirtablePrintDataHandler.uid]: fetchAirtablePrintDataHandler,
  [filterHandler.uid]: filterHandler,
  [filterInHandler.uid]: filterInHandler,
  [flattenHandler.uid]: flattenHandler,
  [formatGoogleSheetHandler.uid]: formatGoogleSheetHandler,
  [googleSearchHandler.uid]: googleSearchHandler,
  [groupHandler.uid]: groupHandler,
  [grubhubAMPImportSheetHandler.uid]: grubhubAMPImportSheetHandler,
  [grubhubFRImportSheetHandler.uid]: grubhubFRImportSheetHandler,
  [grubhubFRQAImportSheetHandler.uid]: grubhubFRQAImportSheetHandler,
  [grubhubImportUsersHandler.uid]: grubhubImportUsersHandler,
  [grubhubPCOImportSheetHandler.uid]: grubhubPCOImportSheetHandler,
  [grubhubMUMidStreamImportSheetHandler.uid]: grubhubMUMidStreamImportSheetHandler,
  [grubhubMURFetchSFDCDataHandler.uid]: grubhubMURFetchSFDCDataHandler,
  [grubhubMURExportToSFDCDataHandler.uid]: grubhubMURExportToSFDCDataHandler,
  [grubhubMUTImportSheetHandler.uid]: grubhubMUTImportSheetHandler,
  [grubhubOperateAutoAssignHandler.uid]: grubhubOperateAutoAssignHandler,
  [grubhubPAImportSheetHandler.uid]: grubhubPAImportSheetHandler,
  [grubhubPUImportSheetHandler.uid]: grubhubPUImportSheetHandler,
  [grubhubPUTImportSheetHandler.uid]: grubhubPUTImportSheetHandler,
  [hotpadsScraperHandler.uid]: hotpadsScraperHandler,
  [hunterDomainsHandler.uid]: hunterDomainsHandler,
  [hunterFinderHandler.uid]: hunterFinderHandler,
  [hunterVerifierHandler.uid]: hunterVerifierHandler,
  [importCsvToSheetHandler.uid]: importCsvToSheetHandler,
  [joinDataHandler.uid]: joinDataHandler,
  [jiraImportHandler.uid]: jiraImportHandler,
  [klarnaAppendWebsiteHandler.uid]: klarnaAppendWebsiteHandler,
  [klarnaCreateFinalDeliverableSheetHandler.uid]: klarnaCreateFinalDeliverableSheetHandler,
  [klarnaIdentifyMisalignmentsHandler.uid]: klarnaIdentifyMisalignmentsHandler,
  [klarnaIdentifySpreadsheetTypeHandler.uid]: klarnaIdentifySpreadsheetTypeHandler,
  [klarnaModifyArrayHandler.uid]: klarnaModifyArrayHandler,
  [klarnaSetVarsHandler.uid]: klarnaSetVarsHandler,
  [klarnaSortFinalDeliverableSheetHandler.uid]: klarnaSortFinalDeliverableSheetHandler,
  [leadGenHandler.uid]: leadGenHandler,
  [mapFieldsHandler.uid]: mapFieldsHandler,
  [notionUpdatePageHandler.uid]: notionUpdatePageHandler,
  [nopHandler.uid]: nopHandler,
  [parseCSVHandler.uid]: parseCSVHandler,
  [pickFieldsHandler.uid]: pickFieldsHandler,
  [rappiPriorityPartnerOrderUpdateHandler.uid]: rappiPriorityPartnerOrderUpdateHandler,
  [readGoogleSheetHandler.uid]: readGoogleSheetHandler,
  [removeEmptyHandler.uid]: removeEmptyHandler,
  [renameTabHandler.uid]: renameTabHandler,
  [resetZoomMeetingPasswordHandler.uid]: resetZoomMeetingPasswordHandler,
  [scrapeLinkedinContactsHandler.uid]: scrapeLinkedinContactsHandler,
  [sendSlackMessageHandler.uid]: sendSlackMessageHandler,
  [sendSlackMessageViaWebhookHandler.uid]: sendSlackMessageViaWebhookHandler,
  [GetEgtOnCallHandler.uid]: GetEgtOnCallHandler,
  [sortByHandler.uid]: sortByHandler,
  [templateHandler.uid]: templateHandler,
  [testFunctionHandler.uid]: testFunctionHandler,
  [titleCaseHandler.uid]: titleCaseHandler,
  [trimWhitespaceHandler.uid]: trimWhitespaceHandler,
  [writeToGoogleSheetHandler.uid]: writeToGoogleSheetHandler,
  [zillowScraperHandler.uid]: zillowScraperHandler,
} as const

export { ALL_HANDLERS }
