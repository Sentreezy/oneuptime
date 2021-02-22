import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UptimeLegend from './UptimeLegend';
import NoMonitor from './NoMonitor';
import MonitorInfo from './MonitorInfo';
import ShouldRender from './ShouldRender';
import Footer from './Footer';
import NotesMain from './NotesMain';
import EventsMain from './EventsMain';
import { API_URL, ACCOUNTS_URL, getServiceStatus } from '../config';
import moment from 'moment';
import { Helmet } from 'react-helmet';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    getStatusPage,
    selectedProbe,
    getScheduledEvent,
} from '../actions/status';
import { getProbes } from '../actions/probe';
import LineChartsContainer from './LineChartsContainer';
import AffectedResources from './basic/AffectedResources';
import SubscribeBox from './Subscribe/SubscribeBox';
import { openSubscribeMenu } from '../actions/subscribe';

const greenBackground = {
    display: 'inline-block',
    borderRadius: '100px',
    height: '8px',
    width: '8px',
    margin: '0 8px 1px 0',
    backgroundColor: 'rgb(117, 211, 128)',
};
const yellowBackground = {
    display: 'inline-block',
    borderRadius: '100px',
    height: '8px',
    width: '8px',
    margin: '0 8px 1px 0',
    backgroundColor: 'rgb(255, 222, 36)',
};
const redBackground = {
    display: 'inline-block',
    borderRadius: '100px',
    height: '8px',
    width: '8px',
    margin: '0 8px 1px 0',
    backgroundColor: 'rgb(250, 117, 90)',
};
const greyBackground = {
    display: 'inline-block',
    borderRadius: '100px',
    height: '8px',
    width: '8px',
    margin: '0 8px 1px 0',
    backgroundColor: 'rgba(107, 124, 147, 0.2)',
};

class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            now: Date.now(),
            nowHandler: null,
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.probes !== this.props.probes) {
            if (this.state.nowHandler) {
                clearTimeout(this.state.nowHandler);
            }

            this.setLastAlive();
        }
        if (
            prevProps.statusData.customJS !== this.props.statusData.customJS &&
            this.props.statusData.customJS
        ) {
            const javascript = document
                .createRange()
                .createContextualFragment(this.props.statusData.customJS);
            document.body.appendChild(javascript);
        }
        if (
            prevProps.statusData.projectId !== this.props.statusData.projectId
        ) {
            this.props.getScheduledEvent(
                this.props.statusData.projectId._id,
                this.props.statusData._id
            );
        }
    }

    setLastAlive = () => {
        this.setState({ now: Date.now() });

        const nowHandler = setTimeout(() => {
            this.setState({ now: Date.now() });
        }, 300000);

        this.setState({ nowHandler });
    };

    componentDidMount() {
        if (
            window.location.search.substring(1) &&
            window.location.search.substring(1) === 'embedded=true'
        ) {
            document.getElementsByTagName('html')[0].style.background =
                'none transparent';
        }

        let statusPageId, url;

        if (
            window.location.pathname.includes('/status-page/') &&
            window.location.pathname.split('/').length >= 3
        ) {
            statusPageId = window.location.pathname.split('/')[2];
            url = 'null';
        } else if (
            window.location.href.indexOf('localhost') > -1 ||
            window.location.href.indexOf('fyipeapp.com') > 0
        ) {
            statusPageId = window.location.host.split('.')[0];
            url = 'null';
        } else {
            statusPageId = 'null';
            url = window.location.host;
        }

        this.props.getProbes(statusPageId, 0, 10).then(() => {
            this.selectbutton(this.props.activeProbe);
        });

        this.props.getStatusPage(statusPageId, url).catch(err => {
            if (err.message === 'Request failed with status code 401') {
                const { loginRequired } = this.props.login;
                if (loginRequired) {
                    window.location = `${ACCOUNTS_URL}/login?statusPage=true&statusPageURL=${window.location.href}`;
                }
            }
        });

        this.setLastAlive();
    }

    groupBy(collection, property) {
        let i = 0,
            val,
            index;
        const values = [],
            result = [];

        for (; i < collection.length; i++) {
            val = collection[i][property]
                ? collection[i][property]['name']
                : 'no-category';
            index = values.indexOf(val);
            if (index > -1) {
                result[index].push(collection[i]);
            } else {
                values.push(val);
                result.push([collection[i]]);
            }
        }
        return result;
    }

    groupedMonitors = () => {
        if (
            this.props.statusData &&
            this.props.statusData.monitorsData !== undefined &&
            this.props.statusData.monitorsData.length > 0
        ) {
            const monitorData = this.props.statusData.monitorsData;
            const groupedMonitorData = this.groupBy(
                monitorData,
                'monitorCategoryId'
            );
            return groupedMonitorData.map((groupedMonitors, i) => {
                return (
                    <div
                        key={i}
                        className="uptime-graph-header"
                        style={{ flexDirection: 'column' }}
                    >
                        {groupedMonitors.map((monitor, i) => {
                            return (
                                <>
                                    <MonitorInfo
                                        monitor={monitor}
                                        selectedCharts={
                                            this.props.monitors.filter(
                                                m => monitor._id === m.monitor
                                            )[0]
                                        }
                                        key={i}
                                        id={`monitor${i}`}
                                        resourceCategory={
                                            monitor.resourceCategory
                                        }
                                        isGroupedByMonitorCategory={
                                            this.props.statusData
                                                .isGroupedByMonitorCategory
                                        }
                                    />
                                    {this.props.monitors.some(
                                        m => monitor._id === m.monitor
                                    ) && (
                                        <LineChartsContainer
                                            monitor={monitor}
                                            selectedCharts={
                                                this.props.monitors.filter(
                                                    m =>
                                                        monitor._id ===
                                                        m.monitor
                                                )[0]
                                            }
                                        />
                                    )}
                                    {i <
                                        this.props.statusData.monitorsData
                                            .length -
                                            1 && (
                                        <div
                                            style={{
                                                margin: '30px 0px',
                                                backgroundColor:
                                                    'rgb(232, 232, 232)',
                                                height: '1px',
                                            }}
                                        />
                                    )}
                                </>
                            );
                        })}
                    </div>
                );
            });
        } else {
            return <NoMonitor />;
        }
    };

    selectbutton = index => {
        this.props.selectedProbe(index);
    };

    renderError = () => {
        const { error } = this.props.status;
        if (error === 'Input data schema mismatch.') {
            return 'Page Not Found';
        } else if (error === 'Project Not present') {
            return 'Invalid Project.';
        } else return error;
    };

    componentWillUnmount() {
        if (this.state.nowHandler) {
            clearTimeout(this.state.nowHandler);
        }
    }

    render() {
        const {
            headerHTML,
            footerHTML,
            customCSS,
            theme,
        } = this.props.statusData;
        const sanitizedCSS = customCSS ? customCSS.split('↵').join('') : '';
        const probes = this.props.probes;
        let view = false;
        let status = '';
        let serviceStatus = '';
        let statusMessage = '';
        let faviconurl = '';
        let isGroupedByMonitorCategory = false;
        const error = this.renderError();
        let heading,
            backgroundMain,
            contentBackground,
            secondaryText,
            primaryText,
            downtimeColor,
            uptimeColor,
            degradedColor,
            disabledColor,
            disabled;
        let statusBackground;
        if (this.props.statusData && this.props.statusData.monitorsData) {
            serviceStatus = getServiceStatus(this.props.monitorState, probes);
            isGroupedByMonitorCategory = this.props.statusData
                .isGroupedByMonitorCategory;
            const colors = this.props.statusData.colors;
            const disabledMonitors =
                this.props.monitorState &&
                this.props.monitorState.filter(m => m.disabled);
            disabled =
                disabledMonitors && disabledMonitors.length ? true : false;
            if (serviceStatus === 'all') {
                status = 'status-bubble status-up';
                statusMessage = 'All services are online';
                faviconurl = '/status-page/greenfavicon.ico';
            } else if (serviceStatus === 'some') {
                status = 'status-bubble status-down';
                statusMessage = 'Some services are offline';
                faviconurl = '/status-page/redfavicon.ico';
            } else if (serviceStatus === 'none') {
                status = 'status-bubble status-down';
                statusMessage = 'All services are offline';
                faviconurl = '/status-page/redfavicon.ico';
            } else if (serviceStatus === 'some-degraded') {
                status = 'status-bubble status-paused';
                statusMessage = 'Some services are degraded';
                faviconurl = '/status-page/yellowfavicon.ico';
            }
            view = true;

            heading = {
                color: `rgba(${colors.heading.r}, ${colors.heading.g}, ${colors.heading.b}, ${colors.heading.a})`,
            };

            secondaryText = {
                color: `rgba(${colors.secondaryText.r}, ${colors.secondaryText.g}, ${colors.secondaryText.b}, ${colors.secondaryText.a})`,
            };

            primaryText = {
                color: `rgba(${colors.primaryText.r}, ${colors.primaryText.g}, ${colors.primaryText.b}, ${colors.primaryText.a})`,
            };

            downtimeColor = {
                backgroundColor: `rgba(${colors.downtime.r}, ${colors.downtime.g}, ${colors.downtime.b})`,
            };

            uptimeColor = {
                backgroundColor: `rgba(${colors.uptime.r}, ${colors.uptime.g}, ${colors.uptime.b})`,
            };

            degradedColor = {
                backgroundColor: `rgba(${colors.degraded.r}, ${colors.degraded.g}, ${colors.degraded.b})`,
            };

            if (colors.disabled) {
                disabledColor = {
                    backgroundColor: `rgba(${colors.disabled.r}, ${colors.disabled.g}, ${colors.disabled.b})`,
                };
            } else {
                disabledColor = {
                    backgroundColor: `rgba(201, 201, 201)`,
                };
            }

            if (serviceStatus === 'all') {
                statusBackground = uptimeColor;
            } else if (serviceStatus === 'some' || serviceStatus === 'none') {
                statusBackground = downtimeColor;
            } else if (serviceStatus === 'some-degraded') {
                statusBackground = degradedColor;
            }

            backgroundMain = {
                background: `rgba(${colors.pageBackground.r}, ${colors.pageBackground.g}, ${colors.pageBackground.b}, ${colors.pageBackground.a})`,
            };

            contentBackground = {
                background: `rgba(${colors.statusPageBackground.r}, ${colors.statusPageBackground.g}, ${colors.statusPageBackground.b}, ${colors.statusPageBackground.a})`,
            };
        }

        const {
            enableRSSFeed,
            smsNotification,
            webhookNotification,
            emailNotification,
        } = this.props.statusPage;
        const showSubscriberOption =
            enableRSSFeed ||
            smsNotification ||
            webhookNotification ||
            emailNotification;

        return (
            <>
                {theme === 'New Theme' ? (
                    <>
                        <div className="new-theme">
                            {this.props.statusData &&
                            this.props.statusData.logoPath ? (
                                <div className="logo_section">
                                    <span>
                                        <img
                                            src={`${API_URL}/file/${this.props.statusData.logoPath}`}
                                            alt=""
                                            className="logo"
                                        />
                                    </span>
                                </div>
                            ) : (
                                ''
                            )}
                            {this.props.statusData &&
                            this.props.statusData.bannerPath ? (
                                <div className="banner-container">
                                    <div className="page-main-wrapper">
                                        {/* Banner */}
                                        <span>
                                            <img
                                                src={`${API_URL}/file/${this.props.statusData.bannerPath}`}
                                                alt=""
                                                className="banner"
                                            />
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                ''
                            )}
                            <div className="subscribe_box">
                                <div>
                                    <a href="https://fyipe.com" target="_blank">
                                        Fyipe's Status Page
                                    </a>
                                </div>
                                <button
                                    className="subscribe_btn"
                                    onClick={() =>
                                        this.props.openSubscribeMenu()
                                    }
                                >
                                    subscribe to updates
                                </button>
                            </div>
                            <div className="new-main-container">
                                <div className="sy-op">
                                    All Systems Operational
                                </div>
                                <div className="op-div border-top">
                                    <div className="op-info">
                                        <div className="collecion_item">
                                            Data Collection & Storage
                                        </div>
                                        <div class="tooltip">
                                            <span className="ques_mark">?</span>
                                            <span class="tooltiptext tooltip1">
                                                Receiving and storing log data
                                                from the customer internally
                                            </span>
                                        </div>
                                    </div>
                                    <div>Operational</div>
                                </div>
                                <div className="op-div">
                                    <div className="op-info">
                                        <div className="collecion_item">
                                            Indexing Data
                                        </div>
                                        <div class="tooltip">
                                            <span className="ques_mark">?</span>
                                            <span class="tooltiptext tooltip2">
                                                indexing log data in our search
                                                engine
                                            </span>
                                        </div>
                                    </div>
                                    <div>Operational</div>
                                </div>
                                <div className="op-div">
                                    <div className="op-info">
                                        <div className="collecion_item">
                                            Website Availability
                                        </div>
                                        <div class="tooltip">
                                            <span className="ques_mark">?</span>
                                            <span class="tooltiptext tooltip3">
                                                The Web interface you use to
                                                view log data
                                            </span>
                                        </div>
                                    </div>
                                    <div>Operational</div>
                                </div>
                                <div className="op-div">
                                    <div className="op-info">
                                        <div className="collecion_item">
                                            Search Availability
                                        </div>
                                        <div class="tooltip">
                                            <span className="ques_mark">?</span>
                                            <span class="tooltiptext tooltip4">
                                                The search engine is returning
                                                results to display in the web
                                                interface or API
                                            </span>
                                        </div>
                                    </div>
                                    <div>Operational</div>
                                </div>
                                <div className="op-div another-div">
                                    <div className="display-flex">
                                        <div>Alerts</div>
                                        <div>Operational</div>
                                    </div>
                                    <div className="line-chart">
                                        <div
                                            className="uptime-graphs box-inner"
                                            style={
                                                isGroupedByMonitorCategory
                                                    ? { paddingBottom: 0 }
                                                    : { paddingBottom: 35 }
                                            }
                                        >
                                            {isGroupedByMonitorCategory ? (
                                                this.groupedMonitors()
                                            ) : this.props.statusData &&
                                              this.props.statusData
                                                  .monitorsData !== undefined &&
                                              this.props.statusData.monitorsData
                                                  .length > 0 ? (
                                                this.props.monitors
                                                    .filter(monitor =>
                                                        this.props.statusData.monitorsData.some(
                                                            m =>
                                                                m._id ===
                                                                monitor.monitor
                                                        )
                                                    )
                                                    .map((monitor, i) => (
                                                        <>
                                                            <MonitorInfo
                                                                monitor={
                                                                    this.props.statusData.monitorsData.filter(
                                                                        m =>
                                                                            m._id ===
                                                                            monitor.monitor
                                                                    )[0]
                                                                }
                                                                selectedCharts={
                                                                    monitor
                                                                }
                                                                key={`uptime-${i}`}
                                                                id={`monitor${i}`}
                                                                isGroupedByMonitorCategory={
                                                                    isGroupedByMonitorCategory
                                                                }
                                                            />
                                                            <LineChartsContainer
                                                                monitor={
                                                                    this.props.statusData.monitorsData.filter(
                                                                        m =>
                                                                            m._id ===
                                                                            monitor.monitor
                                                                    )[0]
                                                                }
                                                                selectedCharts={
                                                                    monitor
                                                                }
                                                                key={`line-charts-${i}`}
                                                            />
                                                            {i <
                                                                this.props
                                                                    .statusData
                                                                    .monitorsData
                                                                    .length -
                                                                    1 && (
                                                                <div
                                                                    style={{
                                                                        margin:
                                                                            '30px 0px',
                                                                        backgroundColor:
                                                                            '#e8e8e8',
                                                                        height:
                                                                            '1px',
                                                                    }}
                                                                />
                                                            )}
                                                        </>
                                                    ))
                                            ) : (
                                                <NoMonitor />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="op-div">
                                    <div className="op-info">
                                        <div className="collecion_item">
                                            API
                                        </div>
                                        <div class="tooltip">
                                            <span className="ques_mark">?</span>
                                            <span class="tooltiptext tooltip5">
                                                Search API's
                                            </span>
                                        </div>
                                    </div>
                                    <div>Operational</div>
                                </div>
                                <div className="op-div">
                                    <div className="op-info">
                                        <div className="collecion_item">
                                            S3 Ingestion
                                        </div>
                                        <div class="tooltip">
                                            <span className="ques_mark">?</span>
                                            <span class="tooltiptext tooltip6">
                                                This is the status of the S3
                                                ingestion service to get the
                                                logs
                                            </span>
                                        </div>
                                    </div>
                                    <div>Operational</div>
                                </div>
                                <div className="op-div">
                                    <div className="op-info">
                                        <div className="collecion_item">
                                            New Account Signup
                                        </div>
                                        <div class="tooltip">
                                            <span className="ques_mark">?</span>
                                            <span class="tooltiptext tooltip7">
                                                New customers can create
                                                accounts
                                            </span>
                                        </div>
                                    </div>
                                    <div>Operational</div>
                                </div>
                            </div>
                            <div className="new-theme-incident">
                                <div className="font-largest">
                                    Past Incidents
                                </div>
                                <ShouldRender
                                    if={
                                        this.props.statusData &&
                                        this.props.statusData.projectId &&
                                        this.props.statusData._id &&
                                        !this.props.statusData
                                            .moveIncidentToTheTop
                                    }
                                >
                                    <NotesMain
                                        projectId={
                                            this.props.statusData.projectId._id
                                        }
                                        statusPageId={this.props.statusData._id}
                                        theme={theme}
                                    />
                                </ShouldRender>
                            </div>
                            <div className="powered">
                                <p>
                                    <a
                                        href="https://fyipe.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={secondaryText}
                                    >
                                        Powered by Fyipe
                                    </a>
                                </p>
                            </div>
                        </div>
                        <ShouldRender
                            if={this.props.subscribed && showSubscriberOption}
                        >
                            <SubscribeBox />
                        </ShouldRender>
                    </>
                ) : (
                    <div className="page-main-wrapper" style={backgroundMain}>
                        {this.props.statusData &&
                        this.props.statusData.bannerPath ? (
                            <span>
                                <img
                                    src={`${API_URL}/file/${this.props.statusData.bannerPath}`}
                                    alt=""
                                    className="banner"
                                />
                            </span>
                        ) : (
                            ''
                        )}
                        {view ? (
                            <div className="innernew">
                                {this.props.events &&
                                    this.props.events.length > 0 &&
                                    this.props.statusData &&
                                    this.props.statusData._id &&
                                    this.props.events.map(event => (
                                        <div
                                            className="content box box__yellow--dark"
                                            style={{
                                                margin: '40px 0px',
                                                cursor: 'pointer',
                                            }}
                                            key={event._id}
                                            onClick={() => {
                                                this.props.history.push(
                                                    `/status-page/${this.props.statusData._id}/scheduledEvent/${event._id}`
                                                );
                                            }}
                                        >
                                            <div className="box-inner ongoing__schedulebox">
                                                <div
                                                    style={{
                                                        textTransform:
                                                            'uppercase',
                                                        fontSize: 11,
                                                        fontWeight: 900,
                                                    }}
                                                >
                                                    Ongoing Scheduled Event
                                                </div>
                                                <div className="ongoing__scheduleitem">
                                                    <span>{event.name}</span>
                                                    <span>
                                                        {event.description}
                                                    </span>
                                                </div>
                                                <div className="ongoing__affectedmonitor">
                                                    <AffectedResources
                                                        event={event}
                                                        monitorState={
                                                            this.props
                                                                .monitorState
                                                        }
                                                    />
                                                </div>

                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        fontSize: 12,
                                                        marginTop: 5,
                                                    }}
                                                >
                                                    {moment(
                                                        event.startDate
                                                    ).format(
                                                        'MMMM Do YYYY, h:mm a'
                                                    )}
                                                    &nbsp;&nbsp;-&nbsp;&nbsp;
                                                    {moment(
                                                        event.endDate
                                                    ).format(
                                                        'MMMM Do YYYY, h:mm a'
                                                    )}
                                                </span>
                                                <span className="sp__icon sp__icon--more"></span>
                                            </div>
                                        </div>
                                    ))}
                                <ShouldRender
                                    if={
                                        this.props.statusData &&
                                        this.props.statusData.projectId &&
                                        this.props.statusData._id &&
                                        this.props.statusData
                                            .moveIncidentToTheTop
                                    }
                                >
                                    <NotesMain
                                        projectId={
                                            this.props.statusData.projectId._id
                                        }
                                        statusPageId={this.props.statusData._id}
                                    />
                                </ShouldRender>
                                <div
                                    className="content"
                                    style={{
                                        position: 'relative',
                                        marginTop: 75,
                                    }}
                                >
                                    {headerHTML ? (
                                        <React.Fragment>
                                            <style>{sanitizedCSS}</style>
                                            <div
                                                id="customHeaderHTML"
                                                dangerouslySetInnerHTML={{
                                                    __html: headerHTML,
                                                }}
                                            />
                                        </React.Fragment>
                                    ) : (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                left: 30,
                                                top: -25,
                                            }}
                                        >
                                            <div>
                                                {this.props.statusData &&
                                                this.props.statusData
                                                    .logoPath ? (
                                                    <span>
                                                        <img
                                                            src={`${API_URL}/file/${this.props.statusData.logoPath}`}
                                                            alt=""
                                                            className="logo"
                                                        />
                                                    </span>
                                                ) : (
                                                    ''
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div
                                        className="white box"
                                        style={contentBackground}
                                    >
                                        <div className="largestatus">
                                            <span
                                                className={status}
                                                style={{
                                                    ...statusBackground,
                                                    width: '30px',
                                                    height: '30px',
                                                }}
                                            ></span>
                                            <div className="title-wrapper">
                                                <span
                                                    className="title"
                                                    style={heading}
                                                >
                                                    {statusMessage}
                                                </span>
                                                <label
                                                    className="status-time"
                                                    style={secondaryText}
                                                >
                                                    As of{' '}
                                                    <span className="current-time">
                                                        {moment(
                                                            new Date()
                                                        ).format('LLLL')}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="btn-group">
                                            {probes.map((probe, index) => (
                                                <button
                                                    onClick={() =>
                                                        this.selectbutton(index)
                                                    }
                                                    style={{
                                                        background:
                                                            backgroundMain.background,
                                                        borderColor:
                                                            contentBackground.background,
                                                    }}
                                                    key={`probes-btn${index}`}
                                                    id={`probes-btn${index}`}
                                                    className={
                                                        this.props
                                                            .activeProbe ===
                                                        index
                                                            ? 'icon-container selected'
                                                            : 'icon-container'
                                                    }
                                                >
                                                    <span
                                                        style={
                                                            // If the page doesn't include any monitor or includes only manual monitors
                                                            // The probe servers will be shown online
                                                            this.props
                                                                .monitorState
                                                                .length === 0 ||
                                                            this.props.monitorState.every(
                                                                monitor =>
                                                                    monitor.type ===
                                                                    'manual'
                                                            )
                                                                ? {
                                                                      ...greenBackground,
                                                                      backgroundColor:
                                                                          uptimeColor.backgroundColor,
                                                                  }
                                                                : probe.lastAlive &&
                                                                  moment(
                                                                      this.state
                                                                          .now
                                                                  ).diff(
                                                                      moment(
                                                                          probe.lastAlive
                                                                      ),
                                                                      'seconds'
                                                                  ) >= 300
                                                                ? greyBackground
                                                                : serviceStatus ===
                                                                      'none' ||
                                                                  serviceStatus ===
                                                                      'some'
                                                                ? {
                                                                      ...redBackground,
                                                                      backgroundColor:
                                                                          downtimeColor.backgroundColor,
                                                                  }
                                                                : serviceStatus ===
                                                                  'some-degraded'
                                                                ? {
                                                                      ...yellowBackground,
                                                                      backgroundColor:
                                                                          degradedColor.backgroundColor,
                                                                  }
                                                                : {
                                                                      ...greenBackground,
                                                                      backgroundColor:
                                                                          uptimeColor.backgroundColor,
                                                                  }
                                                        }
                                                    ></span>
                                                    <span style={heading}>
                                                        {probe.probeName}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        <div
                                            className="statistics"
                                            style={contentBackground}
                                        >
                                            <div className="inner-gradient"></div>
                                            <div
                                                className="uptime-graphs box-inner"
                                                style={
                                                    isGroupedByMonitorCategory
                                                        ? { paddingBottom: 0 }
                                                        : { paddingBottom: 35 }
                                                }
                                            >
                                                {isGroupedByMonitorCategory ? (
                                                    this.groupedMonitors()
                                                ) : this.props.statusData &&
                                                  this.props.statusData
                                                      .monitorsData !==
                                                      undefined &&
                                                  this.props.statusData
                                                      .monitorsData.length >
                                                      0 ? (
                                                    this.props.monitors
                                                        .filter(monitor =>
                                                            this.props.statusData.monitorsData.some(
                                                                m =>
                                                                    m._id ===
                                                                    monitor.monitor
                                                            )
                                                        )
                                                        .map((monitor, i) => (
                                                            <>
                                                                <MonitorInfo
                                                                    monitor={
                                                                        this.props.statusData.monitorsData.filter(
                                                                            m =>
                                                                                m._id ===
                                                                                monitor.monitor
                                                                        )[0]
                                                                    }
                                                                    selectedCharts={
                                                                        monitor
                                                                    }
                                                                    key={`uptime-${i}`}
                                                                    id={`monitor${i}`}
                                                                    isGroupedByMonitorCategory={
                                                                        isGroupedByMonitorCategory
                                                                    }
                                                                />
                                                                <LineChartsContainer
                                                                    monitor={
                                                                        this.props.statusData.monitorsData.filter(
                                                                            m =>
                                                                                m._id ===
                                                                                monitor.monitor
                                                                        )[0]
                                                                    }
                                                                    selectedCharts={
                                                                        monitor
                                                                    }
                                                                    key={`line-charts-${i}`}
                                                                />
                                                                {i <
                                                                    this.props
                                                                        .statusData
                                                                        .monitorsData
                                                                        .length -
                                                                        1 && (
                                                                    <div
                                                                        style={{
                                                                            margin:
                                                                                '30px 0px',
                                                                            backgroundColor:
                                                                                '#e8e8e8',
                                                                            height:
                                                                                '1px',
                                                                        }}
                                                                    />
                                                                )}
                                                            </>
                                                        ))
                                                ) : (
                                                    <NoMonitor />
                                                )}
                                            </div>
                                            {this.props.statusData &&
                                            this.props.statusData
                                                .monitorsData !== undefined &&
                                            this.props.statusData.monitorsData
                                                .length > 0 ? (
                                                <UptimeLegend
                                                    background={
                                                        contentBackground
                                                    }
                                                    secondaryTextColor={
                                                        secondaryText
                                                    }
                                                    downtimeColor={
                                                        downtimeColor
                                                    }
                                                    uptimeColor={uptimeColor}
                                                    degradedColor={
                                                        degradedColor
                                                    }
                                                    disabledColor={
                                                        disabledColor
                                                    }
                                                    disabled={disabled}
                                                />
                                            ) : (
                                                ''
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Helmet>
                                    {this.props.statusData &&
                                    this.props.statusData.faviconPath ? (
                                        <link
                                            rel="shortcut icon"
                                            href={`${API_URL}/file/${this.props.statusData.faviconPath}`}
                                        />
                                    ) : (
                                        <link
                                            rel="shortcut icon"
                                            href={faviconurl}
                                        />
                                    )}
                                    <title>
                                        {this.props.statusData &&
                                        this.props.statusData.title
                                            ? this.props.statusData.title
                                            : 'Status page'}
                                    </title>
                                    <script
                                        src="/status-page/js/landing.base.js"
                                        type="text/javascript"
                                    ></script>
                                </Helmet>
                                <ShouldRender
                                    if={
                                        this.props.statusData &&
                                        this.props.statusData.projectId &&
                                        this.props.statusData._id &&
                                        !this.props.statusData
                                            .moveIncidentToTheTop
                                    }
                                >
                                    <NotesMain
                                        projectId={
                                            this.props.statusData.projectId._id
                                        }
                                        statusPageId={this.props.statusData._id}
                                    />
                                </ShouldRender>
                                <ShouldRender
                                    if={
                                        this.props.statusData &&
                                        this.props.statusData.projectId &&
                                        this.props.statusData._id
                                    }
                                >
                                    <ShouldRender
                                        if={
                                            this.props.statusData
                                                .showScheduledEvents
                                        }
                                    >
                                        <EventsMain
                                            projectId={
                                                this.props.statusData.projectId
                                                    ._id
                                            }
                                            statusPageId={
                                                this.props.statusData._id
                                            }
                                        />
                                    </ShouldRender>
                                </ShouldRender>
                                {footerHTML ? (
                                    <div
                                        id="customFooterHTML"
                                        dangerouslySetInnerHTML={{
                                            __html: footerHTML,
                                        }}
                                    />
                                ) : (
                                    <div id="footer">
                                        <ul>
                                            <ShouldRender
                                                if={
                                                    this.props.statusData &&
                                                    this.props.statusData
                                                        .copyright
                                                }
                                            >
                                                <li>
                                                    {' '}
                                                    <span style={primaryText}>
                                                        &copy;
                                                    </span>{' '}
                                                    {this.props.statusData &&
                                                    this.props.statusData
                                                        .copyright ? (
                                                        <span
                                                            style={primaryText}
                                                        >
                                                            {
                                                                this.props
                                                                    .statusData
                                                                    .copyright
                                                            }
                                                        </span>
                                                    ) : (
                                                        ''
                                                    )}
                                                </li>
                                            </ShouldRender>
                                            <ShouldRender
                                                if={
                                                    this.props.statusData &&
                                                    this.props.statusData
                                                        .links &&
                                                    this.props.statusData.links
                                                        .length
                                                }
                                            >
                                                {this.props.statusData &&
                                                    this.props.statusData
                                                        .links &&
                                                    this.props.statusData.links.map(
                                                        (link, i) => (
                                                            <Footer
                                                                link={link}
                                                                key={i}
                                                                textColor={
                                                                    secondaryText
                                                                }
                                                            />
                                                        )
                                                    )}
                                            </ShouldRender>
                                        </ul>

                                        <p>
                                            <a
                                                href="https://fyipe.com"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={secondaryText}
                                            >
                                                Powered by Fyipe
                                            </a>
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            ''
                        )}

                        <ShouldRender
                            if={
                                this.props.status &&
                                (this.props.status.requesting ||
                                    this.props.status.logs.some(
                                        log => log.requesting
                                    )) &&
                                this.props.requestingEvents
                            }
                        >
                            <div
                                id="app-loading"
                                style={{
                                    position: 'fixed',
                                    top: '0',
                                    bottom: '0',
                                    left: '0',
                                    right: '0',
                                    backgroundColor: '#fdfdfd',
                                    zIndex: '999',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <div style={{ transform: 'scale(2)' }}>
                                    <svg
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="bs-Spinner-svg"
                                    >
                                        <ellipse
                                            cx="12"
                                            cy="12"
                                            rx="10"
                                            ry="10"
                                            className="bs-Spinner-ellipse"
                                        ></ellipse>
                                    </svg>
                                </div>
                            </div>
                        </ShouldRender>
                        <ShouldRender if={error}>
                            <div id="app-loading">
                                <div>{error}</div>
                            </div>
                        </ShouldRender>
                    </div>
                )}
            </>
        );
    }
}

Main.displayName = 'Main';

const mapStateToProps = state => ({
    status: state.status,
    statusData: state.status.statusPage,
    login: state.login,
    activeProbe: state.status.activeProbe,
    monitorState: state.status.statusPage.monitorsData,
    monitors: state.status.statusPage.monitors,
    probes: state.probe.probes,
    events: state.status.events.events,
    requestingEvents: state.status.events.requesting,
    statusPage: state.status.statusPage,
    subscribed: state.subscribe.subscribeMenu,
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            getStatusPage,
            getProbes,
            selectedProbe,
            getScheduledEvent,
            openSubscribeMenu,
        },
        dispatch
    );

Main.propTypes = {
    statusData: PropTypes.object,
    status: PropTypes.object,
    getStatusPage: PropTypes.func,
    getProbes: PropTypes.func,
    login: PropTypes.object.isRequired,
    monitorState: PropTypes.array,
    monitors: PropTypes.array,
    selectedProbe: PropTypes.func,
    activeProbe: PropTypes.number,
    probes: PropTypes.array,
    events: PropTypes.array,
    history: PropTypes.object,
    getScheduledEvent: PropTypes.func,
    requestingEvents: PropTypes.bool,
    openSubscribeMenu: PropTypes.func,
    statusPage: PropTypes.object,
    subscribed: PropTypes.bool,
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
