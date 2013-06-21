var jade = require('jade')
    , util = require('util')
    , fs = require('fs')
    , Q = require('q');

function Mail() {
    this._body = {
        key: "",
        message: {
            html: "",
            text: "",
            subject: "",
            from_email: "YoFresh@rodonsigns.com",
            from_name: "YoFresh@RodonSigns",
            to: [
                {
                    email: "",
                    name: ""
                }
            ],
            headers: {
                'Reply-To': "sales@rodonsigns.com"
            },
            important: false,
            track_opens: true,
            track_clicks: false,
            auto_text: true,
            auto_html: false,
            inline_css: true,
            url_strip_qs: false,
            preserve_recipients: false,
            bcc_address: "",
            tracking_domain: "yofresh.rodonsigns.com",
            signing_domain: null,
            tags: [
                "registration",
                "confirmation"
            ],
            recipient_metadata: [
                {
                    rcpt: "",
                    values: {
                        user_id: ""
                    }
                }
            ]
        },
        async: true,
        ip_pool: "Main Pool"
    };
}

/*
* creates registration confirmation email template
* @fields: object containing - 
*   name: recipient's name
*   email: their email
*   user_id: their user id
*/
Mail.prototype.create_registration = function(fields) {
    var body
        , path = process.cwd() + '/worker/tpls/registration-confirmation.jade'
        , tpl = ''
        , self = this
        , def = Q.defer();

    if (typeof self.registration_tpl !== 'function') {
        fs.readFile(path, {encoding: 'utf8'}, function(e, t) {
            console.log(e)
            if (!e) {
                self.registration_tpl = jade.compile(t);
                body = render(self.registration_tpl, self._body, fields);
                def.resolve(JSON.stringify(body));
            } else {
                body = render(null, self._body, fields);
                def.resolve(JSON.stringify(body));
            }
        });
    } else {
        body = render(self.registration_tpl, self._body, fields);
        def.resolve(JSON.stringify(body));
    }

    function render(fn, body, fields) {
        var tpl = '';
        var b = {};

        util._extend(b, body);

        if (fn && typeof fn === 'function') tpl = fn(fields);
        else {
            tpl = 
                'Registration Confirmation\r\n\r\n' +
                fields.name + ' thank you for registering with YoFresh@RodonSigns.\n' +
                'YoFresh@RodonSigns provides you with the ability to quickly and efficiently\n' +
                'order sign supplies for your YoFresh business.\r\n\r\n' +
                'Please visit the YoFresh@RodonSigns Store (yofresh.rodonsigns.com) and\n' +
                'place your order today.\r\n\r\n' +
                'If you have any questions don\'t hesitate to email or call us any time.\n' +
                'Email: sales@rodonsigns.com and Phone: 215-885-5358\r\n';
        }

        (typeof fn === 'function') ? b.message.html = tpl : b.message.text = tpl;
        b.message.subject = 'YoFresh@RodonSigns Registration Confirmation';
        b.message.to[0].email = fields.email;
        b.message.to[0].name = fields.name;
        b.message.recipient_metadata[0].rcpt = fields.email;
        b.message.recipient_metadata[0].values.user_id = fields.user_id;

        return (b);
    }

    return def.promise;
}

module.exports = new Mail();