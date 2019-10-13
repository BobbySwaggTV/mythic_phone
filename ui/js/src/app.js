import Config from './config';
import Data from './data';
import Utils from './utils';
import Notif from './notification';
import Apps from './apps/apps';

import Test from './test';

var appTrail = [
    {
        app: null,
        data: null,
        fade: null
    }
];

var navDisabled = false;

moment.fn.fromNowOrNow = function(a) {
    if (Math.abs(moment().diff(this)) < 60000) {
        return 'just now';
    }
    return this.fromNow(a);
};

$(function() {
    $('.wrapper').fadeIn();
    Data.ClearData();
    Data.SetupData([
        { name: 'myData', data: Test.PlayerDetails },
        { name: 'contacts', data: Test.Contacts },
        { name: 'messages', data: Test.Messages },
        { name: 'history', data: Test.Calls },
        { name: 'apps', data: Config.Apps },
        { name: 'muted', data: false },
        { name: 'tweets', data: Test.Tweets },
        { name: 'adverts', data: Test.Adverts },
        { name: 'factory-tunes', data: Test.FactoryTunes },
        { name: 'custom-tunes', data: Test.Tunes },
        { name: 'bank-accounts', data: Test.Accounts }
    ]);

    OpenApp('home', null, true);
});

window.addEventListener('message', function(event) {
    switch (event.data.action) {
        case 'show':
            $('.wrapper').show('slide', { direction: 'down' }, 500);

            if (!Apps.Phone.Call.IsCallPending()) {
                OpenApp('home', null, true);
            } else {
                appTrail = [
                    {
                        app: 'home',
                        data: null,
                        fade: false
                    }
                ];
                OpenApp(
                    'phone-call',
                    {
                        number: event.data.number,
                        receiver: !event.data.initiator
                    },
                    false
                );
            }
            break;
        case 'hide':
            ClosePhone();
            break;
        case 'receiveCall':
            OpenApp(
                'phone-call',
                { number: event.data.number, receiver: true },
                false
            );
            break;
    }
});

function InitShit() {
    $('.modal').modal();
    $('.dropdown-trigger').dropdown({
        constrainWidth: false
    });
    $('.tabs').tabs();
    //$('select').formSelect();
    $('.char-count-input').characterCounter();
    $('.phone-number').mask('000-000-0000', { placeholder: '###-###-####' });
}

$(function() {
    document.onkeyup = function(data) {
        if (data.which == 114 || data.which == 27) {
            ClosePhone();
        }
    };
});

$('.phone-header').on('click', '.in-call', function(e) {
    if (appTrail[appTrail.length - 1].app != 'phone-call') {
        OpenApp('phone-call', null, false);
    }
});

$('.back-button').on('click', function(e) {
    if (!navDisabled) {
        GoBack();
        navDisabled = true;
        setTimeout(function() {
            navDisabled = false;
        }, 500);
    }
});

$('.home-button').on('click', function(e) {
    if (!navDisabled) {
        GoHome();
        navDisabled = true;
        setTimeout(function() {
            navDisabled = false;
        }, 500);
    }
});

$('.close-button').on('click', function(e) {
    ClosePhone();
});

$('#remove-sim-card').on('click', function(e) {
    let modal = M.Modal.getInstance($('#remove-sim-conf'));
    modal.close();
    Utils.NotifyAltSim(false);
    Notif.Alert('Sim Removed');
});

$('.mute').on('click', function(e) {
    let muted = Data.GetData('muted');
    Utils.SetMute(!muted);
});

function ClosePhone() {
    $.post(Config.ROOT_ADDRESS + '/ClosePhone', JSON.stringify({}));
    $('.wrapper').hide('slide', { direction: 'down' }, 500, function() {  
        $('#screen-content').trigger(`${appTrail[appTrail.length - 1].app}-close-app`);
        $('#toast-container').remove();
        $('.material-tooltip').remove();
        $('.app-container').hide();
        appTrail = [
            {
                app: null,
                data: null,
                fade: null
            }
        ];
    });
}

function SetupApp(app, data, pop, disableFade, exit) {
    $.ajax({
        url: `./html/apps/${app}.html`,
        cache: false,
        dataType: "html",
        statusCode: {
            404: function() {
                appTrail.push({ app: app, data: null, fade: false, close: exit });
                Notif.Alert('App Doesn\'t Exist', 1000);
                GoHome();
            }
        },
        success: function(response) {
            $('#screen-content').html(response);
            InitShit();
        
            window.dispatchEvent(new CustomEvent(`${appTrail[appTrail.length - 1].app}-close-app`));
            if (pop) {
                appTrail.pop();
                disableFade = null;
                appTrail.pop();
            }
        
            appTrail.push({
                app: app,
                data: data,
                fade: disableFade,
                close: exit
            });
        
            $('.material-tooltip').remove();
            window.dispatchEvent(new CustomEvent(`${app}-open-app`, { data: data }));
            
            $('#screen-content').show();
        }
    });
}

window.addEventListener('custom-close-finish', function(data) {
    if (data.detail.disableFade) {
        SetupApp(data.detail.app, data.detail.data, data.detail.pop, data.detail.disableFade, data.detail.customExit);
    } else {
        $('#screen-content').fadeOut('fast', function() {
            SetupApp(data.detail.app, data.detail.data, data.detail.pop, data.detail.disableFade, data.detail.customExit);
        });
    }
});

function OpenApp(app, data = null, pop = false, disableFade = false, customExit = false) {
    if ($('#screen-content .app-container').length <= 0 || disableFade) {
        if (appTrail[appTrail.length - 1].close) {
            window.dispatchEvent(new CustomEvent(`${appTrail[appTrail.length - 1].app}-custom-close-app`, { detail: { app: app, data: data, pop: pop, disableFade: disableFade, customExit: customExit } }));
        } else {
            SetupApp(app, data, pop, disableFade, customExit);
        }
        
    } else {
        if (appTrail[appTrail.length - 1].close) {
            window.dispatchEvent(new CustomEvent(`${appTrail[appTrail.length - 1].app}-custom-close-app`, { detail: { app: app, data: data, pop: pop, disableFade: disableFade, customExit: customExit } }));
        } else {
            $('#screen-content').fadeOut('fast', function() {
                SetupApp(app, data, pop, disableFade, customExit);
            });
        }
    }
}

function RefreshApp() {
    $('.material-tooltip').remove();
    $('#screen-content').trigger(`${appTrail[appTrail.length - 1].app}-open-app`, [ appTrail[appTrail.length - 1].data ]);
}

function GoHome() {
    if (appTrail[appTrail.length - 1].app !== 'home') {
        OpenApp('home');
    }
}

function GoBack() {
    if (appTrail[appTrail.length - 1].app !== 'home') {
        if (appTrail.length > 1) {
            OpenApp(
                appTrail[appTrail.length - 2].app,
                appTrail[appTrail.length - 2].data,
                true,
                appTrail[appTrail.length - 1].fade,
                appTrail[appTrail.length - 2].close
            );
        } else {
            GoHome();
        }
    }
}

function GetCurrentApp() {
    return appTrail[appTrail.length - 1].app;
}

export default { GoHome, GoBack, OpenApp, RefreshApp, GetCurrentApp };
