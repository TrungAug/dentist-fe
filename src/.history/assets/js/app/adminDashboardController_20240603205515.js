console.log("AdminDashboardController");
app.controller('AdminDashboardController', function ($scope, $http, $rootScope, $location) {
    let url = "http://localhost:8080/api/v1"
    let headers = {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "X-Refresh-Token": localStorage.getItem("refreshToken"),
    }


    $scope.chartArea = function () {
        var areachart, areaChartOptions = {
            series: [{
                name: "Website",
                data: [31, 28, 30, 51, 42, 109, 100, 31, 40, 28, 31, 58, 30, 51, 42, 109, 100, 116]
            }, {
                name: "Mobile Apps",
                data: [11, 45, 20, 32, 34, 52, 41, 11, 32, 45, 11, 75, 20, 32, 34, 52, 41, 81]
            }, {
                name: "Others",
                data: [5, 25, 9, 14, 14, 32, 21, 5, 12, 25, 5, 55, 9, 14, 14, 32, 21, 65]
            }],
            chart: {
                type: "area",
                height: 350,
                background: "transparent",
                stacked: !0,
                toolbar: {
                    show: !1
                },
                zoom: {
                    enabled: !1
                }
            },
            theme: {
                mode: colors.chartTheme
            },
            xaxis: {
                type: "datetime",
                categories: ["01/01/2020 GMT", "01/02/2020 GMT", "01/03/2020 GMT", "01/04/2020 GMT", "01/05/2020 GMT", "01/06/2020 GMT", "01/07/2020 GMT", "01/08/2020 GMT", "01/09/2020 GMT", "01/10/2020 GMT", "01/11/2020 GMT", "01/12/2020 GMT", "01/13/2020 GMT", "01/14/2020 GMT", "01/15/2020 GMT", "01/16/2020 GMT", "01/17/2020 GMT", "01/18/2020 GMT"],
                labels: {
                    show: !0,
                    trim: !1,
                    minHeight: void 0,
                    maxHeight: 120,
                    style: {
                        colors: colors.mutedColor,
                        cssClass: "text-muted",
                        fontFamily: base.defaultFontFamily
                    }
                },
                axisBorder: {
                    show: !1
                },
                tooltip: {
                    enabled: !1,
                    offsetX: 0
                }
            },
            yaxis: {
                labels: {
                    show: !0,
                    trim: !1,
                    offsetX: -10,
                    minHeight: void 0,
                    maxHeight: 120,
                    style: {
                        colors: colors.mutedColor,
                        cssClass: "text-muted",
                        fontFamily: base.defaultFontFamily
                    }
                }
            },
            markers: {
                size: 0,
                strokeColors: "#fff",
                strokeWidth: 0,
                strokeOpacity: .9,
                strokeDashArray: 0,
                fillOpacity: 1,
                discrete: [],
                shape: "circle",
                radius: 2,
                offsetX: 0,
                offsetY: 0,
                onClick: void 0,
                onDblClick: void 0,
                showNullDataPoints: !0,
                hover: {
                    size: void 0,
                    sizeOffset: 3
                }
            },
            colors: chartColors,
            dataLabels: {
                enabled: !1
            },
            stroke: {
                curve: "smooth",
                lineCap: "round",
                width: 0
            },
            fill: {
                type: "solid"
            },
            legend: {
                show: !1,
                position: "bottom",
                fontFamily: base.defaultFontFamily,
                fontWeight: 400,
                labels: {
                    colors: colors.mutedColor,
                    useSeriesColors: !1
                },
                markers: {
                    width: 10,
                    height: 10,
                    strokeWidth: 0,
                    strokeColor: "#fff",
                    radius: 6
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 0
                },
                onItemClick: {
                    toggleDataSeries: !0
                },
                onItemHover: {
                    highlightDataSeries: !0
                }
            },
            grid: {
                show: !0,
                borderColor: colors.borderColor,
                strokeDashArray: 0,
                position: "back",
                xaxis: {
                    lines: {
                        show: !1
                    }
                },
                yaxis: {
                    lines: {
                        show: !0
                    }
                },
                row: {
                    colors: void 0,
                    opacity: .5
                },
                column: {
                    colors: void 0,
                    opacity: .5
                },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }
            },
            tooltip: {
                style: {
                    fontSize: "12px",
                    fontFamily: base.defaultFontFamily
                }
            }
        },
            areachartCtn = document.querySelector("#areaChart");
        areachartCtn && (areachart = new ApexCharts(areachartCtn, areaChartOptions)).render();
    }

    $scope.radialbarWidgetChart = function () {
        var radialbarWidgetChart, radialbarWidgetOptions = {
            series: [86],
            chart: {
                height: 120,
                type: "radialBar"
            },
            theme: {
                mode: colors.chartTheme
            },
            plotOptions: {
                radialBar: {
                    hollow: {
                        size: "70%"
                    },
                    track: {
                        background: colors.borderColor
                    },
                    dataLabels: {
                        show: !0,
                        name: {
                            fontSize: "0.875rem",
                            fontWeight: 400,
                            offsetY: -10,
                            show: !1,
                            color: colors.mutedColor,
                            fontFamily: base.defaultFontFamily
                        },
                        value: {
                            formatter: function (e) {
                                return parseInt(e)
                            },
                            fontSize: "1.53125rem",
                            fontWeight: 700,
                            fontFamily: base.defaultFontFamily,
                            offsetY: 10,
                            show: !0,
                            color: colors.headingColor
                        },
                        total: {
                            show: !1,
                            fontSize: "0.875rem",
                            fontWeight: 400,
                            offsetY: -10,
                            label: "Percent",
                            color: colors.mutedColor,
                            fontFamily: base.defaultFontFamily
                        }
                    }
                }
            },
            fill: {
                type: "gradient",
                gradient: {
                    shade: "light",
                    type: "diagonal2",
                    shadeIntensity: .2,
                    gradientFromColors: [extend.primaryColorLighter],
                    gradientToColors: [base.primaryColor],
                    inverseColors: !0,
                    opacityFrom: 1,
                    opacityTo: 1,
                    stops: [20, 100]
                }
            },
            stroke: {
                lineCap: "round"
            }
        },
            radialbarWidget = document.querySelector("#radialbarWidget");
        radialbarWidget && (radialbarWidgetChart = new ApexCharts(radialbarWidget, radialbarWidgetOptions)).render();
    }

    $scope.radialbarChart = function () {
        var radialbarChart, radialbarOptions = {
            series: [70],
            chart: {
                height: 200,
                type: "radialBar"
            },
            plotOptions: {
                radialBar: {
                    hollow: {
                        size: "75%"
                    },
                    track: {
                        background: colors.borderColor
                    },
                    dataLabels: {
                        show: !0,
                        name: {
                            fontSize: "0.875rem",
                            fontWeight: 400,
                            offsetY: -10,
                            show: !0,
                            color: colors.mutedColor,
                            fontFamily: base.defaultFontFamily
                        },
                        value: {
                            formatter: function (e) {
                                return parseInt(e)
                            },
                            color: colors.headingColor,
                            fontSize: "1.53125rem",
                            fontWeight: 700,
                            fontFamily: base.defaultFontFamily,
                            offsetY: 5,
                            show: !0
                        },
                        total: {
                            show: !0,
                            fontSize: "0.875rem",
                            fontWeight: 400,
                            offsetY: -10,
                            label: "Percent",
                            color: colors.mutedColor,
                            fontFamily: base.defaultFontFamily
                        }
                    }
                }
            },
            fill: {
                type: "gradient",
                gradient: {
                    shade: "light",
                    type: "diagonal2",
                    shadeIntensity: .2,
                    gradientFromColors: [extend.primaryColorLighter],
                    gradientToColors: [extend.primaryColorDark],
                    inverseColors: !0,
                    opacityFrom: 1,
                    opacityTo: 1,
                    stops: [20, 100]
                }
            },
            stroke: {
                lineCap: "round"
            },
            labels: ["CPU"]
        },
            radialbar = document.querySelector("#radialbar");
        radialbar && (radialbarChart = new ApexCharts(radialbar, radialbarOptions)).render();
    }

    $scope.barChartWidget=function(){
        var barChartWidget, barChartWidgetoptions = {
            series: [{
                name: "Revenue",
                data: [44, 55, 41, 64, 22, 43, 36]
            }, {
                name: "Total",
                data: [53, 32, 33, 52, 13, 44, 26]
            }, {
                name: "Cost",
                data: [13, 12, 13, 32, 3, 24, 18]
            }],
            chart: {
                type: "bar",
                height: 165,
                stacked: !0,
                zoom: {
                    enabled: !0
                },
                toolbar: {
                    show: !1
                }
            },
            theme: {
                mode: colors.chartTheme
            },
            dataLabels: {
                enabled: !1
            },
            plotOptions: {
                bar: {
                    horizontal: !0,
                    columnWidth: "20%",
                    barHeight: "40%"
                }
            },
            xaxis: {
                categories: ["Monday", "Tuesday", "Wednesday", "Thusday", "Friday", "Saturday", "Sunday"],
                labels: {
                    show: !1
                },
                axisBorder: {
                    show: !1
                },
                axisTicks: {
                    show: !1
                }
            },
            yaxis: {
                labels: {
                    show: !1
                },
                reversed: !0
            },
            legend: {
                show: !1
            },
            fill: {
                opacity: 1,
                colors: chartColors
            },
            grid: {
                show: !1,
                padding: {
                    top: -15,
                    right: -15,
                    bottom: -15,
                    left: -10
                },
                position: "back"
            }
        },
        barChartWidgetCtn = document.querySelector("#barChartWidget");
    barChartWidgetCtn && (barChartWidget = new ApexCharts(barChartWidgetCtn, barChartWidgetoptions)).render();
    }

    $scope.chartArea();
    $scope.radialbarWidgetChart();
    $scope.radialbarChart();
    $scope.barChartWidget();
})

