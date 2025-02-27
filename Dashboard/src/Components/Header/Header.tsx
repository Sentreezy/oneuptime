import React, {
    FunctionComponent,
    ReactElement,
    useEffect,
    useState,
} from 'react';
// import SearchBox from './SearchBox';
// import Notifications from './Notifications';
import Help from './Help';
import UserProfile from './UserProfile';
import ProjectPicker from './ProjectPicker';
import Header from 'CommonUI/src/Components/Header/Header';
import Project from 'Model/Models/Project';
import Logo from './Logo';
import { BILLING_ENABLED, getAllEnvVars } from 'CommonUI/src/Config';
import ModelAPI from 'CommonUI/src/Utils/ModelAPI/ModelAPI';
import BillingPaymentMethod from 'Model/Models/BillingPaymentMethod';
import useAsyncEffect from 'use-async-effect';
import GlobalEvents from 'CommonUI/src/Utils/GlobalEvents';
import EventName from '../../Utils/EventName';
import SubscriptionPlan from 'Common/Types/Billing/SubscriptionPlan';
import Button, { ButtonStyleType } from 'CommonUI/src/Components/Button/Button';
import Navigation from 'CommonUI/src/Utils/Navigation';
import RouteMap, { RouteUtil } from '../../Utils/RouteMap';
import PageMap from '../../Utils/PageMap';
import Upgrade from './Upgrade';
import { IconProp, SizeProp } from 'CommonUI/src/Components/Icon/Icon';
import Route from 'Common/Types/API/Route';
import TeamMember from 'Model/Models/TeamMember';
import User from 'CommonUI/src/Utils/User';
import Incident from 'Model/Models/Incident';
import OneUptimeDate from 'Common/Types/Date';
import HeaderModelAlert from 'CommonUI/src/Components/HeaderAlert/HeaderModelAlert';
import HeaderAlert from 'CommonUI/src/Components/HeaderAlert/HeaderAlert';

export interface ComponentProps {
    projects: Array<Project>;
    onProjectSelected: (project: Project) => void;
    showProjectModal: boolean;
    onProjectModalClose: () => void;
    selectedProject: Project | null;
}

const DashboardHeader: FunctionComponent<ComponentProps> = (
    props: ComponentProps
): ReactElement => {
    const [isPaymentMethodCountLoading, setPaymentMethodCountLoading] =
        useState<boolean>(false);
    const [paymentMethodCount, setPaymentMethodCount] = useState<number | null>(
        null
    );

    const [activeIncidentToggleRefresh, setActiveIncidentToggleRefresh] =
        useState<boolean>(true);

    useAsyncEffect(async () => {
        if (
            props.selectedProject &&
            props.selectedProject._id &&
            BILLING_ENABLED
        ) {
            setPaymentMethodCountLoading(true);
            const paymentMethodsCount: number = await ModelAPI.count(
                BillingPaymentMethod,
                { projectId: props.selectedProject?._id }
            );
            setPaymentMethodCount(paymentMethodsCount);
            setPaymentMethodCountLoading(false);
        }
    }, [props.selectedProject]);

    const refreshIncidentCount: Function = () => {
        setActiveIncidentToggleRefresh(!activeIncidentToggleRefresh);
    };

    useEffect(() => {
        GlobalEvents.addEventListener(
            EventName.ACTIVE_INCIDENTS_COUNT_REFRESH,
            refreshIncidentCount
        );

        return () => {
            // on unmount.
            GlobalEvents.removeEventListener(
                EventName.ACTIVE_INCIDENTS_COUNT_REFRESH,
                refreshIncidentCount
            );
        };
    }, []);

    return (
        <>
            <Header
                leftComponents={
                    <>
                        {props.projects.length === 0 && (
                            <Logo onClick={() => {}} />
                        )}

                        <ProjectPicker
                            showProjectModal={props.showProjectModal}
                            onProjectModalClose={props.onProjectModalClose}
                            projects={props.projects}
                            onProjectSelected={props.onProjectSelected}
                        />

                        <div className="flex">
                            <HeaderModelAlert<TeamMember>
                                icon={IconProp.Folder}
                                className="rounded-md m-3 bg-indigo-500 p-3  hover:bg-indigo-600 cursor-pointer ml-0"
                                modelType={TeamMember}
                                query={{
                                    userId: User.getUserId(),
                                    hasAcceptedInvitation: false,
                                }}
                                singularName="Project Invitation"
                                pluralName="Project Invitations"
                                requestOptions={{
                                    isMultiTenantRequest: true,
                                }}
                                onClick={() => {
                                    Navigation.navigate(
                                        RouteMap[PageMap.PROJECT_INVITATIONS]!
                                    );
                                }}
                                style={{
                                    marginRight: '10px',
                                }}
                            />

                            <HeaderModelAlert<Incident>
                                icon={IconProp.Alert}
                                modelType={Incident}
                                className="rounded-md m-3 bg-red-500 p-3  hover:bg-red-600 cursor-pointer ml-0"
                                query={{
                                    currentIncidentState: {
                                        order: 1,
                                    },
                                }}
                                refreshToggle={activeIncidentToggleRefresh}
                                singularName="Active Incident"
                                pluralName="Active Incidents"
                                requestOptions={{
                                    isMultiTenantRequest: true,
                                }}
                                onClick={() => {
                                    Navigation.navigate(
                                        RouteMap[PageMap.ACTIVE_INCIDENTS]!
                                    );
                                }}
                                style={{
                                    marginRight: '10px',
                                }}
                            />

                            {props.selectedProject?.trialEndsAt &&
                                BILLING_ENABLED &&
                                OneUptimeDate.getNumberOfDaysBetweenDatesInclusive(
                                    OneUptimeDate.getCurrentDate(),
                                    props.selectedProject?.trialEndsAt!
                                ) > 0 && (
                                    <HeaderAlert
                                        icon={IconProp.Clock}
                                        className="rounded-md m-3 bg-indigo-500 p-3  ml-0"
                                        title={`Trial ends in ${OneUptimeDate.getNumberOfDaysBetweenDatesInclusive(
                                            OneUptimeDate.getCurrentDate(),
                                            props.selectedProject?.trialEndsAt!
                                        )} ${
                                            OneUptimeDate.getNumberOfDaysBetweenDatesInclusive(
                                                OneUptimeDate.getCurrentDate(),
                                                props.selectedProject
                                                    ?.trialEndsAt!
                                            ) > 1
                                                ? 'days'
                                                : 'day'
                                        }`}
                                    />
                                )}
                        </div>
                    </>
                }
                centerComponents={
                    <>
                        {/* <SearchBox
                            key={2}
                            selectedProject={props.selectedProject}
                            onChange={(_value: string) => { }}
                        />{' '} */}
                    </>
                }
                rightComponents={
                    <>
                        {/* <Notifications /> */}
                        {BILLING_ENABLED &&
                        props.selectedProject?.id &&
                        props.selectedProject.paymentProviderPlanId &&
                        !SubscriptionPlan.isFreePlan(
                            props.selectedProject.paymentProviderPlanId,
                            getAllEnvVars()
                        ) &&
                        !SubscriptionPlan.isCustomPricingPlan(
                            props.selectedProject.paymentProviderPlanId,
                            getAllEnvVars()
                        ) &&
                        !isPaymentMethodCountLoading &&
                        paymentMethodCount === 0 ? (
                            <Button
                                title="Add Card Details"
                                onClick={() => {
                                    Navigation.navigate(
                                        RouteUtil.populateRouteParams(
                                            RouteMap[
                                                PageMap.SETTINGS_BILLING
                                            ] as Route
                                        )
                                    );
                                }}
                                buttonStyle={ButtonStyleType.LINK}
                                icon={IconProp.Billing}
                                iconSize={SizeProp.Larger}
                            ></Button>
                        ) : (
                            <></>
                        )}
                        {BILLING_ENABLED &&
                        props.selectedProject?.id &&
                        props.selectedProject.paymentProviderPlanId &&
                        SubscriptionPlan.isFreePlan(
                            props.selectedProject.paymentProviderPlanId,
                            getAllEnvVars()
                        ) ? (
                            <Upgrade />
                        ) : (
                            <></>
                        )}
                        <Help />
                        <UserProfile
                            onClickUserProfle={() => {
                                Navigation.navigate(
                                    RouteMap[PageMap.USER_PROFILE]!
                                );
                            }}
                        />
                    </>
                }
            />
        </>
    );
};

export default DashboardHeader;
