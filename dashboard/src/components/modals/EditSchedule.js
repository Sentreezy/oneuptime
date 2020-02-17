import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import 'imrc-datetime-picker/dist/imrc-datetime-picker.css';
import { reduxForm, Field, formValueSelector } from 'redux-form';

import { updateScheduledEvent } from '../../actions/scheduledEvent';
import { closeModal } from '../../actions/modal';
import ShouldRender from '../basic/ShouldRender';
import { FormLoader } from '../basic/Loader';
import { RenderField } from '../basic/RenderField';
import { RenderTextArea } from '../basic/RenderTextArea';
import DateTimeSelector from '../basic/DateTimeSelector';



function validate(values) {

    const errors = {};

    if (!values.name) {
        errors.name = 'Event name is required'
    }
    if (!values.description) {
        errors.description = 'Event description is required';
    }
    return errors;
}

class UpdateSchedule extends React.Component {

    state = {
        currentDate: moment(),
    };

    submitForm = (values) => {
        const { updateScheduledEvent, closeModal, updateScheduledEventModalId } = this.props;
        const projectId = this.props.currentProject._id;
        const scheduledEventId = this.props.initialValues._id;
        const postObj = {};

        postObj.name = values.name;
        postObj.startDate = moment(values.startDate);
        postObj.endDate = moment(values.endDate);
        postObj.description = values.description;
        postObj.showEventOnStatusPage = values.showEventOnStatusPage;
        postObj.callScheduleOnEvent = values.callScheduleOnEvent;
        postObj.monitorDuringEvent = values.monitorDuringEvent;
        postObj.alertSubscriber = values.alertSubscriber;

        updateScheduledEvent(projectId, scheduledEventId, postObj)
            .then(() => {
                closeModal({
                    id: updateScheduledEventModalId
                });
            });
    }

    handleKeyBoard = (e) => {
        const { closeModal, updateScheduledEventModalId } = this.props;
        switch (e.key) {
            case 'Escape':
                return closeModal({
                    id: updateScheduledEventModalId
                })
            default:
                return false;
        }
    }

    render() {
        const { currentDate } = this.state;
        const { requesting, scheduledEventError, startDate } = this.props;
        const { handleSubmit, closeModal } = this.props;

        return (
            <div onKeyDown={this.handleKeyBoard} className="ModalLayer-contents" tabIndex="-1" style={{ marginTop: '40px' }}>
                <div className="bs-BIM">
                    <div className="bs-Modal" style={{ width: 500 }}>
                        <div className="bs-Modal-header">
                            <div className="bs-Modal-header-copy"
                                style={{ marginBottom: '10px', marginTop: '10px' }}>
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--20 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                    <span>Update Scheduled event</span>
                                </span>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit(this.submitForm)}>
                            <div className="bs-Modal-content Padding-horizontal--12">
                                <div className="bs-Modal-block bs-u-paddingless">

                                    <div className="bs-Modal-content">

                                        <div className="bs-Fieldset-wrapper Box-root Margin-bottom--2">
                                            <fieldset className="Margin-bottom--16">
                                                <div className="bs-Fieldset-rows">
                                                    <div className="bs-Fieldset-row" style={{ padding: 0 }}>
                                                        <label className="bs-Fieldset-label Text-align--left" htmlFor="endpoint">
                                                            <span>Event name</span>
                                                        </label>
                                                        <div className="bs-Fieldset-fields">
                                                            <div className="bs-Fieldset-field" style={{ width: '70%' }}>
                                                                <Field
                                                                    component={RenderField}
                                                                    name="name"
                                                                    placeholder="Event name"
                                                                    id="name"
                                                                    className="bs-TextInput"
                                                                    style={{ width: 300, padding: '3px 5px' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </fieldset>

                                            <fieldset className="Margin-bottom--16">
                                                <div className="bs-Fieldset-rows">
                                                    <div className="bs-Fieldset-row" style={{ padding: 0 }}>
                                                        <label className="bs-Fieldset-label Text-align--left" htmlFor="monitorIds">
                                                            <span>Start date and time</span>
                                                        </label>
                                                        <div className="bs-Fieldset-fields">
                                                            <div className="bs-Fieldset-field">
                                                                <Field
                                                                    className="bs-TextInput"
                                                                    type="text"
                                                                    name="startDate"
                                                                    component={DateTimeSelector}
                                                                    placeholder="10pm"
                                                                    style={{ width: '300px' }}
                                                                    minDate={currentDate}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </fieldset>
                                            <fieldset className="Margin-bottom--16">
                                                <div className="bs-Fieldset-rows">
                                                    <div className="bs-Fieldset-row" style={{ padding: 0 }}>
                                                        <label className="bs-Fieldset-label Text-align--left" htmlFor="monitorIds">
                                                            <span>End date and time</span>
                                                        </label>
                                                        <div className="bs-Fieldset-fields">
                                                            <div className="bs-Fieldset-field">
                                                                <Field
                                                                    className="db-BusinessSettings-input TextInput bs-TextInput"
                                                                    type="text"
                                                                    name="endDate"
                                                                    component={DateTimeSelector}
                                                                    placeholder="10pm"
                                                                    style={{ width: '300px' }}
                                                                    minDate={startDate}
                                                                    onChange={this.handleChangeEndDate}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </fieldset>
                                            <fieldset className="Margin-bottom--16">
                                                <div className="bs-Fieldset-rows">
                                                    <div className="bs-Fieldset-row" style={{ padding: 0 }}>
                                                        <label className="bs-Fieldset-label Text-align--left" htmlFor="monitorIds">
                                                            <span>Event Description</span>
                                                        </label>
                                                        <div className="bs-Fieldset-fields">
                                                            <div className="bs-Fieldset-field" style={{ width: '300px', }}>
                                                                <Field className="bs-TextArea"
                                                                    component={RenderTextArea}
                                                                    type="text"
                                                                    name="description"
                                                                    rows="5"
                                                                    id="description"
                                                                    placeholder="Event Description"
                                                                    style={{ width: '300px', resize: 'none' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </fieldset>
                                            <div className="bs-Fieldset-row">
                                                <label className="bs-Fieldset-label" style={{ flex: '25% 0 0' }}><span></span></label>
                                                <div className="bs-Fieldset-fields bs-Fieldset-fields--wide">
                                                    <div className="Box-root" style={{ height: '5px' }}></div>
                                                    <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--column Flex-justifyContent--flexStart">
                                                        <label className="Checkbox" htmlFor="showEventOnStatusPage">
                                                            <Field
                                                                component="input"
                                                                type="checkbox"
                                                                name="showEventOnStatusPage"
                                                                className="Checkbox-source"
                                                                id='showEventOnStatusPage'
                                                            />
                                                            <div className="Checkbox-box Box-root Margin-top--2 Margin-right--2">
                                                                <div className="Checkbox-target Box-root">
                                                                    <div className="Checkbox-color Box-root"></div>
                                                                </div>
                                                            </div>
                                                            <div className="Checkbox-label Box-root Margin-left--8">
                                                                <span className="Text-color--default Text-display--inline Text-fontSize--14 Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                                    <span>Show this event on Status Page</span>
                                                                </span>
                                                            </div>
                                                        </label>

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bs-Fieldset-row">
                                                <label className="bs-Fieldset-label" style={{ flex: '25% 0 0' }}><span></span></label>
                                                <div className="bs-Fieldset-fields bs-Fieldset-fields--wide">
                                                    <div className="Box-root" style={{ height: '5px' }}></div>
                                                    <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--column Flex-justifyContent--flexStart">
                                                        <label className="Checkbox" htmlFor="callScheduleOnEvent">
                                                            <Field
                                                                component="input"
                                                                type="checkbox"
                                                                name="callScheduleOnEvent"
                                                                className="Checkbox-source"
                                                                id="callScheduleOnEvent"
                                                            />
                                                            <div className="Checkbox-box Box-root Margin-top--2 Margin-right--2">
                                                                <div className="Checkbox-target Box-root">
                                                                    <div className="Checkbox-color Box-root"></div>
                                                                </div>
                                                            </div>
                                                            <div className="Checkbox-label Box-root Margin-left--8">
                                                                <span className="Text-color--default Text-display--inline Text-fontSize--14 Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                                    <span>Alert your team members who are on call when this event starts</span>
                                                                </span>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bs-Fieldset-row">
                                                <label className="bs-Fieldset-label" style={{ flex: '25% 0 0' }}><span></span></label>
                                                <div className="bs-Fieldset-fields bs-Fieldset-fields--wide">
                                                    <div className="Box-root" style={{ height: '5px' }}></div>
                                                    <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--column Flex-justifyContent--flexStart">
                                                        <label className="Checkbox" htmlFor="alertSubscriber">
                                                            <Field
                                                                component="input"
                                                                type="checkbox"
                                                                name="alertSubscriber"
                                                                className="Checkbox-source"
                                                                id="alertSubscriber"
                                                            />
                                                            <div className="Checkbox-box Box-root Margin-top--2 Margin-right--2">
                                                                <div className="Checkbox-target Box-root">
                                                                    <div className="Checkbox-color Box-root"></div>
                                                                </div>
                                                            </div>
                                                            <div className="Checkbox-label Box-root Margin-left--8">
                                                                <span className="Text-color--default Text-display--inline Text-fontSize--14 Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                                    <span>Alert subscribers about this scheduled event</span>
                                                                </span>
                                                            </div>
                                                        </label>

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bs-Fieldset-row">
                                                <label className="bs-Fieldset-label" style={{ flex: '25% 0 0' }}><span></span></label>
                                                <div className="bs-Fieldset-fields bs-Fieldset-fields--wide">
                                                    <div className="Box-root" style={{ height: '5px' }}></div>
                                                    <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--column Flex-justifyContent--flexStart">
                                                        <label className="Checkbox" htmlFor="monitorDuringEvent">
                                                            <Field
                                                                component="input"
                                                                type="checkbox"
                                                                name="monitorDuringEvent"
                                                                className="Checkbox-source"
                                                                id="monitorDuringEvent"
                                                            />
                                                            <div className="Checkbox-box Box-root Margin-top--2 Margin-right--2">
                                                                <div className="Checkbox-target Box-root">
                                                                    <div className="Checkbox-color Box-root"></div>
                                                                </div>
                                                            </div>
                                                            <div className="Checkbox-label Box-root Margin-left--8">
                                                                <span className="Text-color--default Text-display--inline Text-fontSize--14 Text-lineHeight--20 Text-typeface--base Text-wrap--wrap">
                                                                    <span>Do not monitor this monitor during this event</span>
                                                                </span>
                                                            </div>
                                                        </label>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bs-Modal-footer">
                                <div className="bs-Modal-footer-actions">
                                    <ShouldRender if={scheduledEventError}>
                                        <div className="bs-Tail-copy">
                                            <div className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart" style={{ marginTop: '10px' }}>
                                                <div className="Box-root Margin-right--8">
                                                    <div className="Icon Icon--info Icon--color--red Icon--size--14 Box-root Flex-flex">
                                                    </div>
                                                </div>
                                                <div className="Box-root">
                                                    <span style={{ color: 'red' }}>{scheduledEventError}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </ShouldRender>
                                    <button className="bs-Button bs-DeprecatedButton" type="button" onClick={() => closeModal({
                                        id: this.props.updateScheduledEventModalId
                                    })}>
                                        <span>Cancel</span></button>
                                    <button
                                        id="updateScheduledEventButton"
                                        className="bs-Button bs-DeprecatedButton bs-Button--blue"
                                        disabled={requesting}
                                        type="submit">
                                        {!requesting && <span>Update</span>}
                                        {requesting && <FormLoader />}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

UpdateSchedule.displayName = 'UpdateSchedule';


UpdateSchedule.propTypes = {
    currentProject: PropTypes.object,
    closeModal: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    updateScheduledEvent: PropTypes.func.isRequired,
    updateScheduledEventModalId: PropTypes.string,
    requesting: PropTypes.bool,
    scheduledEventError: PropTypes.object,
    initialValues: PropTypes.object,
    startDate: PropTypes.object,
};

const NewUpdateSchedule = reduxForm({
    form: 'newUpdateSchedule',
    enableReinitialize: true,
    validate,
    destroyOnUnmount: true
})(UpdateSchedule);

const mapDispatchToProps = dispatch => bindActionCreators(
    {
        updateScheduledEvent,
        closeModal
    }
    , dispatch);


const selector = formValueSelector('newUpdateSchedule');

const mapStateToProps = state => {

    const scheduledEventToBeUpdated = state.modal.modals[0].event;
    const initialValues = {};
    const startDate = selector(state, 'startDate');

    if (scheduledEventToBeUpdated) {
        initialValues.name = scheduledEventToBeUpdated.name;
        initialValues.startDate = scheduledEventToBeUpdated.startDate ? scheduledEventToBeUpdated.startDate : null;
        initialValues.endDate = scheduledEventToBeUpdated.startDate ? scheduledEventToBeUpdated.endDate : null;
        initialValues.description = scheduledEventToBeUpdated.description;
        initialValues.showEventOnStatusPage = scheduledEventToBeUpdated.showEventOnStatusPage;
        initialValues.callScheduleOnEvent = scheduledEventToBeUpdated.callScheduleOnEvent;
        initialValues.monitorDuringEvent = scheduledEventToBeUpdated.monitorDuringEvent;
        initialValues.alertSubscriber = scheduledEventToBeUpdated.alertSubscriber;
        initialValues._id = scheduledEventToBeUpdated._id
    }


    return {
        currentProject: state.project.currentProject,
        updatedScheduledEvent: state.scheduledEvent.updatedScheduledEvent,
        scheduledEventError: state.scheduledEvent.updatedScheduledEvent.error,
        requesting: state.scheduledEvent.updatedScheduledEvent.requesting,
        updateScheduledEventModalId: state.modal.modals[0].id,
        initialValues,
        startDate
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewUpdateSchedule);
