/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiButtonEmpty, EuiAccordion, EuiHorizontalRule, EuiPanel, EuiSpacer } from '@elastic/eui';
import React, { useCallback, useRef, useState } from 'react';
import { Redirect } from 'react-router-dom';

import { HeaderPage } from '../../../components/header_page';
import { WrapperPage } from '../../../components/wrapper_page';
import { AccordionTitle } from './components/accordion_title';
import { StepAboutRule } from './components/step_about_rule';
import { StepDefineRule } from './components/step_define_rule';
import { StepScheduleRule } from './components/step_schedule_rule';
import { usePersistRule } from '../../../containers/detection_engine/rules/persist_rule';
import { SpyRoute } from '../../../utils/route/spy_routes';

import { formatRule } from './helpers';
import * as i18n from './translations';
import { AboutStepRule, DefineStepRule, RuleStep, RuleStepData, ScheduleStepRule } from './types';
import { DETECTION_ENGINE_PAGE_NAME } from '../../../components/link_to/redirect_to_detection_engine';

const stepsRuleOrder = [RuleStep.defineRule, RuleStep.aboutRule, RuleStep.scheduleRule];

export const CreateRuleComponent = React.memo(() => {
  const [openAccordionId, setOpenAccordionId] = useState<RuleStep | null>(RuleStep.defineRule);
  const defineRuleRef = useRef<EuiAccordion | null>(null);
  const aboutRuleRef = useRef<EuiAccordion | null>(null);
  const scheduleRuleRef = useRef<EuiAccordion | null>(null);
  const stepsData = useRef<Record<RuleStep, RuleStepData>>({
    [RuleStep.defineRule]: { isValid: false, data: {} },
    [RuleStep.aboutRule]: { isValid: false, data: {} },
    [RuleStep.scheduleRule]: { isValid: false, data: {} },
  });
  const [isStepRuleInEditView, setIsStepRuleInEditView] = useState<Record<RuleStep, boolean>>({
    [RuleStep.defineRule]: false,
    [RuleStep.aboutRule]: false,
    [RuleStep.scheduleRule]: false,
  });
  const [{ isLoading, isSaved }, setRule] = usePersistRule();

  const setStepData = (step: RuleStep, data: unknown, isValid: boolean) => {
    stepsData.current[step] = { ...stepsData.current[step], data, isValid };
    if (isValid) {
      const stepRuleIdx = stepsRuleOrder.findIndex(item => step === item);
      if ([0, 1].includes(stepRuleIdx)) {
        setIsStepRuleInEditView({
          ...isStepRuleInEditView,
          [step]: true,
        });
        if (openAccordionId !== stepsRuleOrder[stepRuleIdx + 1]) {
          openCloseAccordion(stepsRuleOrder[stepRuleIdx + 1]);
          setOpenAccordionId(stepsRuleOrder[stepRuleIdx + 1]);
        }
      } else if (
        stepRuleIdx === 2 &&
        stepsData.current[RuleStep.defineRule].isValid &&
        stepsData.current[RuleStep.aboutRule].isValid
      ) {
        setRule(
          formatRule(
            stepsData.current[RuleStep.defineRule].data as DefineStepRule,
            stepsData.current[RuleStep.aboutRule].data as AboutStepRule,
            stepsData.current[RuleStep.scheduleRule].data as ScheduleStepRule
          )
        );
      }
    }
  };

  const getAccordionType = useCallback(
    (accordionId: RuleStep) => {
      if (accordionId === openAccordionId) {
        return 'active';
      } else if (stepsData.current[accordionId].isValid) {
        return 'valid';
      }
      return 'passive';
    },
    [openAccordionId, stepsData.current]
  );

  const defineRuleButton = (
    <AccordionTitle
      name="1"
      title={i18n.DEFINE_RULE}
      type={getAccordionType(RuleStep.defineRule)}
    />
  );

  const aboutRuleButton = (
    <AccordionTitle name="2" title={i18n.ABOUT_RULE} type={getAccordionType(RuleStep.aboutRule)} />
  );

  const scheduleRuleButton = (
    <AccordionTitle
      name="3"
      title={i18n.SCHEDULE_RULE}
      type={getAccordionType(RuleStep.scheduleRule)}
    />
  );

  const openCloseAccordion = (accordionId: RuleStep | null) => {
    if (accordionId != null) {
      if (accordionId === RuleStep.defineRule && defineRuleRef.current != null) {
        defineRuleRef.current.onToggle();
      } else if (accordionId === RuleStep.aboutRule && aboutRuleRef.current != null) {
        aboutRuleRef.current.onToggle();
      } else if (accordionId === RuleStep.scheduleRule && scheduleRuleRef.current != null) {
        scheduleRuleRef.current.onToggle();
      }
    }
  };

  const manageAccordions = useCallback(
    (id: RuleStep, isOpen: boolean) => {
      const activeRuleIdx = stepsRuleOrder.findIndex(step => step === openAccordionId);
      const stepRuleIdx = stepsRuleOrder.findIndex(step => step === id);
      const isLatestStepsRuleValid =
        stepRuleIdx === 0
          ? true
          : stepsRuleOrder
              .filter((stepRule, index) => index < stepRuleIdx)
              .every(stepRule => stepsData.current[stepRule].isValid);

      if (stepRuleIdx < activeRuleIdx && !isOpen) {
        openCloseAccordion(id);
      } else if (stepRuleIdx >= activeRuleIdx) {
        if (
          openAccordionId != null &&
          openAccordionId !== id &&
          !stepsData.current[openAccordionId].isValid &&
          !isStepRuleInEditView[id] &&
          isOpen
        ) {
          openCloseAccordion(id);
        } else if (!isLatestStepsRuleValid && isOpen) {
          openCloseAccordion(id);
        } else if (id !== openAccordionId && isOpen) {
          setOpenAccordionId(id);
        }
      }
    },
    [isStepRuleInEditView, openAccordionId]
  );

  const manageIsEditable = useCallback(
    (id: RuleStep) => {
      setIsStepRuleInEditView({
        ...isStepRuleInEditView,
        [id]: false,
      });
    },
    [isStepRuleInEditView]
  );

  if (isSaved && stepsData.current[RuleStep.scheduleRule].isValid) {
    return <Redirect to={`/${DETECTION_ENGINE_PAGE_NAME}/rules`} />;
  }

  return (
    <>
      <WrapperPage restrictWidth>
        <HeaderPage
          backOptions={{ href: '#detection-engine/rules', text: 'Back to rules' }}
          border
          isLoading={isLoading}
          title={i18n.PAGE_TITLE}
        />
        <EuiPanel>
          <EuiAccordion
            initialIsOpen={true}
            id={RuleStep.defineRule}
            buttonContent={defineRuleButton}
            paddingSize="xs"
            ref={defineRuleRef}
            onToggle={manageAccordions.bind(null, RuleStep.defineRule)}
            extraAction={
              stepsData.current[RuleStep.defineRule].isValid && (
                <EuiButtonEmpty
                  iconType="pencil"
                  size="xs"
                  onClick={manageIsEditable.bind(null, RuleStep.defineRule)}
                >
                  {`Edit`}
                </EuiButtonEmpty>
              )
            }
          >
            <EuiHorizontalRule margin="xs" />
            <StepDefineRule
              isEditView={isStepRuleInEditView[RuleStep.defineRule]}
              isLoading={isLoading}
              setStepData={setStepData}
            />
          </EuiAccordion>
        </EuiPanel>
        <EuiSpacer size="s" />
        <EuiPanel>
          <EuiAccordion
            initialIsOpen={false}
            id={RuleStep.aboutRule}
            buttonContent={aboutRuleButton}
            paddingSize="xs"
            ref={aboutRuleRef}
            onToggle={manageAccordions.bind(null, RuleStep.aboutRule)}
            extraAction={
              stepsData.current[RuleStep.aboutRule].isValid && (
                <EuiButtonEmpty
                  iconType="pencil"
                  size="xs"
                  onClick={manageIsEditable.bind(null, RuleStep.aboutRule)}
                >
                  {`Edit`}
                </EuiButtonEmpty>
              )
            }
          >
            <EuiHorizontalRule margin="xs" />
            <StepAboutRule
              isEditView={isStepRuleInEditView[RuleStep.aboutRule]}
              isLoading={isLoading}
              setStepData={setStepData}
            />
          </EuiAccordion>
        </EuiPanel>
        <EuiSpacer size="s" />
        <EuiPanel>
          <EuiAccordion
            initialIsOpen={false}
            id={RuleStep.scheduleRule}
            buttonContent={scheduleRuleButton}
            paddingSize="xs"
            ref={scheduleRuleRef}
            onToggle={manageAccordions.bind(null, RuleStep.scheduleRule)}
            extraAction={
              stepsData.current[RuleStep.scheduleRule].isValid && (
                <EuiButtonEmpty
                  iconType="pencil"
                  size="xs"
                  onClick={manageIsEditable.bind(null, RuleStep.scheduleRule)}
                >
                  {`Edit`}
                </EuiButtonEmpty>
              )
            }
          >
            <EuiHorizontalRule margin="xs" />
            <StepScheduleRule
              isEditView={isStepRuleInEditView[RuleStep.scheduleRule]}
              isLoading={isLoading}
              setStepData={setStepData}
            />
          </EuiAccordion>
        </EuiPanel>
      </WrapperPage>

      <SpyRoute />
    </>
  );
});
CreateRuleComponent.displayName = 'CreateRuleComponent';
