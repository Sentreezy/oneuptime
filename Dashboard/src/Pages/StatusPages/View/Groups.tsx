import Route from 'Common/Types/API/Route';
import Page from 'CommonUI/src/Components/Page/Page';
import React, { FunctionComponent, ReactElement } from 'react';
import PageMap from '../../../Utils/PageMap';
import RouteMap, { RouteUtil } from '../../../Utils/RouteMap';
import PageComponentProps from '../../PageComponentProps';
import SideMenu from './SideMenu';
import DashboardNavigation from '../../../Utils/Navigation';
import ObjectID from 'Common/Types/ObjectID';
import StatusPageGroup from 'Model/Models/StatusPageGroup';
import ModelTable from 'CommonUI/src/Components/ModelTable/ModelTable';
import BadDataException from 'Common/Types/Exception/BadDataException';
import { IconProp } from 'CommonUI/src/Components/Icon/Icon';
import FormFieldSchemaType from 'CommonUI/src/Components/Forms/Types/FormFieldSchemaType';
import FieldType from 'CommonUI/src/Components/Types/FieldType';
import SortOrder from 'Common/Types/Database/SortOrder';
import Navigation from 'CommonUI/src/Utils/Navigation';
const StatusPageDelete: FunctionComponent<PageComponentProps> = (
    props: PageComponentProps
): ReactElement => {
    const modelId: ObjectID = Navigation.getLastParamAsObjectID(1);

    return (
        <Page
            title={'Status Page'}
            breadcrumbLinks={[
                {
                    title: 'Project',
                    to: RouteUtil.populateRouteParams(
                        RouteMap[PageMap.HOME] as Route,
                        modelId
                    ),
                },
                {
                    title: 'Status Pages',
                    to: RouteUtil.populateRouteParams(
                        RouteMap[PageMap.STATUS_PAGES] as Route,
                        modelId
                    ),
                },
                {
                    title: 'View Status Page',
                    to: RouteUtil.populateRouteParams(
                        RouteMap[PageMap.STATUS_PAGE_VIEW] as Route,
                        modelId
                    ),
                },
                {
                    title: 'Resource Groups',
                    to: RouteUtil.populateRouteParams(
                        RouteMap[PageMap.STATUS_PAGE_VIEW_GROUPS] as Route,
                        modelId
                    ),
                },
            ]}
            sideMenu={<SideMenu modelId={modelId} />}
        >
            <ModelTable<StatusPageGroup>
                modelType={StatusPageGroup}
                id="status-page-group"
                name="Status Page > Groups"
                isDeleteable={true}
                sortBy="order"
                sortOrder={SortOrder.Ascending}
                isCreateable={true}
                isViewable={false}
                isEditable={true}
                query={{
                    statusPageId: modelId,
                    projectId: DashboardNavigation.getProjectId()?.toString(),
                }}
                enableDragAndDrop={true}
                dragDropIndexField="order"
                onBeforeCreate={(
                    item: StatusPageGroup
                ): Promise<StatusPageGroup> => {
                    if (!props.currentProject || !props.currentProject.id) {
                        throw new BadDataException('Project ID cannot be null');
                    }
                    item.statusPageId = modelId;
                    item.projectId = props.currentProject.id;
                    return Promise.resolve(item);
                }}
                cardProps={{
                    icon: IconProp.Folder,
                    title: 'Resource Groups',
                    description:
                        'Here are different groups for your status page resources.',
                }}
                noItemsMessage={
                    'No status page group created for this status page.'
                }
                formFields={[
                    {
                        field: {
                            name: true,
                        },
                        title: 'Group Name',
                        fieldType: FormFieldSchemaType.Text,
                        required: true,
                        placeholder: 'Resource Group Name',
                    },
                    {
                        field: {
                            description: true,
                        },
                        title: 'Group Description',
                        fieldType: FormFieldSchemaType.LongText,
                        required: false,
                        placeholder: 'Resource Group Description',
                    },
                    {
                        field: {
                            isExpandedByDefault: true,
                        },
                        title: 'Is this group expanded by default on the staus page?',
                        fieldType: FormFieldSchemaType.Checkbox,
                        required: false,
                    },
                ]}
                showRefreshButton={true}
                showFilterButton={true}
                viewPageRoute={Navigation.getCurrentRoute()}
                columns={[
                    {
                        field: {
                            name: true,
                        },
                        title: 'Name',
                        type: FieldType.Text,
                        isFilterable: true,
                    },
                    {
                        field: {
                            description: true,
                        },
                        title: 'Description',
                        type: FieldType.Text,
                        isFilterable: true,
                    },
                    {
                        field: {
                            isExpandedByDefault: true,
                        },
                        title: 'Expanded on Status Page by Default',
                        type: FieldType.Boolean,
                        isFilterable: true,
                    },
                ]}
            />
        </Page>
    );
};

export default StatusPageDelete;
