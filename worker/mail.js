var jade = require('jade')
    , util = require('util')
    , fs = require('fs')
    , Q = require('q');

function Mail() {
    this._body = {
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
            tags: [],
            recipient_metadata: [
                {
                    rcpt: "",
                    values: {
                        user_id: ""
                    }
                }
            ]
        },
        async: true
    };
    this._templates = [];
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
        , path = process.cwd() + '/tpls/registration-confirmation.jade'
        , tpl = ''
        , self = this
        , def = Q.defer();

    if (typeof self._templates['registration_confirmation'] !== 'function') {
        fs.readFile(path, {encoding: 'utf8'}, function(e, t) {
            console.log(e)
            if (!e) {
                self._templates['registration_confirmation'] = jade.compile(t);
                body = render(self._templates['registration_confirmation'], self._body, fields);
                def.resolve(body);
            } else {
                body = render(null, self._body, fields);
                def.resolve(body);
            }
        });
    } else {
        body = render(self._templates['registration_confirmation'], self._body, fields);
        def.resolve(body);
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
        b.message.tags = ["registration", "confirmation"];

        return (b);
    }

    return def.promise;
}

Mail.prototype.create_new_order = function(fields) {
    var def = Q.defer()
        , self = this
        , path = process.cwd() + '/tpls/new-order.jade'
        , tpl = ''
        , body;

    if (typeof self._templates['new_order'] !== 'function') {
        fs.readFile(path, {encoding: 'utf8'}, function(e, t) {
            console.log(e)
            if (!e) {
                self._templates['new_order'] = jade.compile(t);
                body = render(self._templates['new_order'], self._body, fields);
                def.resolve(body);
            } else {
                body = render(null, self._body, fields);
                def.resolve(body);
            }
        });
    } else {
        body = render(self._templates['new_order'], self._body, fields);
        def.resolve(body);
    }

    function render(fn, body, fields) {
        var tpl = '';
        var b = {};

        util._extend(b, body);

        if (fn && typeof fn === 'function') tpl = fn(fields);
        else {
            tpl = 
                'New Order Confirmation\r\n\r\n' +
                fields.user.name + ' thank you for placing an order with YoFresh@RodonSigns.\n' +
                'Your order confirmation number is: ' + fields.confirmation_number + ' \r\n\r\n' +
                'Order Summary:\n';
            fields.items.forEach(function(v) {
                tpl += v.name;
                if (('selected_flavors' in v) && v.selected_flavors.length > 0) tpl += '(' + v.selected_flavors.toString() + ')';
                else tpl += ' - quantity of: ' + v.quantity + ' - total: $' + v.total; 
            });

            tpl += '\r\n\r\n' +
                    'subtotal: $' + field.subtotal + '\n' +
                    'shipping: $' + field.shipping + '\n' +
                    'tax: $' + field.tax + '\n' +
                    'total payment: $' + fields.total;
            tpl += '\r\n\r\n' +
                'If you have any questions don\'t hesitate to email or call us any time.\n' +
                'Email: sales@rodonsigns.com and Phone: 215-885-5358\r\n';
        }

        (typeof fn === 'function') ? b.message.html = tpl : b.message.text = tpl;
        b.message.subject = 'YoFresh@RodonSigns Order Confirmation';
        b.message.to[0].email = fields.user.email;
        b.message.to[0].name = fields.user.name;
        b.message.recipient_metadata[0].rcpt = fields.user.email;
        b.message.recipient_metadata[0].values.user_id = fields.user_id;
        b.message.tags = ["order", "confirmation"];

        return (b);
    }

    return def.promise;
}

Mail.prototype.create_payment_conf = function(fields) {
    var def = Q.defer()
        , self = this
        , path = process.cwd() + '/tpls/payment-confirmation.jade'
        , tpl = ''
        , body;

    if (typeof self._templates['payment_conf'] !== 'function') {
        fs.readFile(path, {encoding: 'utf8'}, function(e, t) {
            console.log(e)
            if (!e) {
                self._templates['payment_conf'] = jade.compile(t);
                body = render(self._templates['payment_conf'], self._body, fields);
                def.resolve(body);
            } else {
                body = render(null, self._body, fields);
                def.resolve(body);
            }
        });
    } else {
        body = render(self._templates['payment_conf'], self._body, fields);
        def.resolve(body);
    }

    function render(fn, body, fields) {
        var tpl = '';
        var b = {};

        util._extend(b, body);

        if (fn && typeof fn === 'function') tpl = fn(fields);
        else {
            tpl = 
                'Payment Confirmation\r\n\r\n' +
                fields.user.first + ' thank you for placing an order with YoFresh@RodonSigns.\n' +
                'Your ' + fields.payment.card.type + ' ending with ' + fields.payment.card.last4 + ' \n' +
                'was charged $' + (fields.payment.amount /100).toFixed(2) +'\r\n\r\n';

            tpl += 'If you have any questions don\'t hesitate to email or call us any time.\n' +
                'Email: sales@rodonsigns.com and Phone: 215-885-5358\r\n';
        }

        (typeof fn === 'function') ? b.message.html = tpl : b.message.text = tpl;
        b.message.subject = 'YoFresh@RodonSigns Payment Confirmation';
        b.message.to[0].email = fields.user.email;
        b.message.to[0].name = fields.user.first;
        b.message.recipient_metadata[0].rcpt = fields.user.email;
        b.message.recipient_metadata[0].values.user_id = fields.user_id;
        b.message.tags = ["payment", "confirmation"];

        return (b);
    }

    return def.promise;
}

module.exports = new Mail();