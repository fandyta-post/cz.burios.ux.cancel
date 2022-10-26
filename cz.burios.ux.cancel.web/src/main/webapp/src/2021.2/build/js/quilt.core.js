(function (f, define) {
    define('quilt.core', ['jquery'], f);
}(function () {
    var __meta__ = {
        id: 'core',
        name: 'Core',
        category: 'framework',
        description: 'The core of the Quilt framework.'
    };
    (function ($, window, undefined) {
        var quilt = window.quilt = window.quilt || { cultures: {} }, extend = $.extend, each = $.each, isArray = $.isArray, proxy = $.proxy, noop = $.noop, math = Math, Template, JSON = window.JSON || {}, support = {}, percentRegExp = /%/, formatRegExp = /\{(\d+)(:[^\}]+)?\}/g, boxShadowRegExp = /(\d+(?:\.?)\d*)px\s*(\d+(?:\.?)\d*)px\s*(\d+(?:\.?)\d*)px\s*(\d+)?/i, numberRegExp = /^(\+|-?)\d+(\.?)\d*$/, FUNCTION = 'function', STRING = 'string', NUMBER = 'number', OBJECT = 'object', NULL = 'null', BOOLEAN = 'boolean', UNDEFINED = 'undefined', getterCache = {}, setterCache = {}, slice = [].slice, noDepricateExtend = function () {
                var src, copyIsArray, copy, name, options, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
                if (typeof target === 'boolean') {
                    deep = target;
                    target = arguments[i] || {};
                    i++;
                }
                if (typeof target !== 'object' && !jQuery.isFunction(target)) {
                    target = {};
                }
                if (i === length) {
                    target = this;
                    i--;
                }
                for (; i < length; i++) {
                    if ((options = arguments[i]) != null) {
                        for (name in options) {
                            if (name == 'filters' || name == 'concat' || name == ':') {
                                continue;
                            }
                            src = target[name];
                            copy = options[name];
                            if (target === copy) {
                                continue;
                            }
                            if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                                if (copyIsArray) {
                                    copyIsArray = false;
                                    clone = src && jQuery.isArray(src) ? src : [];
                                } else {
                                    clone = src && jQuery.isPlainObject(src) ? src : {};
                                }
                                target[name] = noDepricateExtend(deep, clone, copy);
                            } else if (copy !== undefined) {
                                target[name] = copy;
                            }
                        }
                    }
                }
                return target;
            };
        quilt.version = '2021.2.616'.replace(/^\s+|\s+$/g, '');
        function Class() {
        }
        Class.extend = function (proto) {
            var base = function () {
                }, member, that = this, subclass = proto && proto.init ? proto.init : function () {
                    that.apply(this, arguments);
                }, fn;
            base.prototype = that.prototype;
            fn = subclass.fn = subclass.prototype = new base();
            for (member in proto) {
                if (proto[member] != null && proto[member].constructor === Object) {
                    fn[member] = extend(true, {}, base.prototype[member], proto[member]);
                } else {
                    fn[member] = proto[member];
                }
            }
            fn.constructor = subclass;
            subclass.extend = that.extend;
            return subclass;
        };
        Class.prototype._initOptions = function (options) {
            this.options = deepExtend({}, this.options, options);
        };
        var isFunction = quilt.isFunction = function (fn) {
            return typeof fn === 'function';
        };
        var preventDefault = function () {
            this._defaultPrevented = true;
        };
        var isDefaultPrevented = function () {
            return this._defaultPrevented === true;
        };
        var Observable = Class.extend({
            init: function () {
                this._events = {};
            },
            bind: function (eventName, handlers, one) {
                var that = this, idx, eventNames = typeof eventName === STRING ? [eventName] : eventName, length, original, handler, handlersIsFunction = typeof handlers === FUNCTION, events;
                if (handlers === undefined) {
                    for (idx in eventName) {
                        that.bind(idx, eventName[idx]);
                    }
                    return that;
                }
                for (idx = 0, length = eventNames.length; idx < length; idx++) {
                    eventName = eventNames[idx];
                    handler = handlersIsFunction ? handlers : handlers[eventName];
                    if (handler) {
                        if (one) {
                            original = handler;
                            handler = function () {
                                that.unbind(eventName, handler);
                                original.apply(that, arguments);
                            };
                            handler.original = original;
                        }
                        events = that._events[eventName] = that._events[eventName] || [];
                        events.push(handler);
                    }
                }
                return that;
            },
            one: function (eventNames, handlers) {
                return this.bind(eventNames, handlers, true);
            },
            first: function (eventName, handlers) {
                var that = this, idx, eventNames = typeof eventName === STRING ? [eventName] : eventName, length, handler, handlersIsFunction = typeof handlers === FUNCTION, events;
                for (idx = 0, length = eventNames.length; idx < length; idx++) {
                    eventName = eventNames[idx];
                    handler = handlersIsFunction ? handlers : handlers[eventName];
                    if (handler) {
                        events = that._events[eventName] = that._events[eventName] || [];
                        events.unshift(handler);
                    }
                }
                return that;
            },
            trigger: function (eventName, e) {
                var that = this, events = that._events[eventName], idx, length;
                if (events) {
                    e = e || {};
                    e.sender = that;
                    e._defaultPrevented = false;
                    e.preventDefault = preventDefault;
                    e.isDefaultPrevented = isDefaultPrevented;
                    events = events.slice();
                    for (idx = 0, length = events.length; idx < length; idx++) {
                        events[idx].call(that, e);
                    }
                    return e._defaultPrevented === true;
                }
                return false;
            },
            unbind: function (eventName, handler) {
                var that = this, events = that._events[eventName], idx;
                if (eventName === undefined) {
                    that._events = {};
                } else if (events) {
                    if (handler) {
                        for (idx = events.length - 1; idx >= 0; idx--) {
                            if (events[idx] === handler || events[idx].original === handler) {
                                events.splice(idx, 1);
                            }
                        }
                    } else {
                        that._events[eventName] = [];
                    }
                }
                return that;
            }
        });
        function compilePart(part, stringPart) {
            if (stringPart) {
                return '\'' + part.split('\'').join('\\\'').split('\\"').join('\\\\\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '\'';
            } else {
                var first = part.charAt(0), rest = part.substring(1);
                if (first === '=') {
                    return '+(' + rest + ')+';
                } else if (first === ':') {
                    return '+$quiltHtmlEncode(' + rest + ')+';
                } else {
                    return ';' + part + ';$quiltOutput+=';
                }
            }
        }
        var argumentNameRegExp = /^\w+/, encodeRegExp = /\$\{([^}]*)\}/g, escapedCurlyRegExp = /\\\}/g, curlyRegExp = /__CURLY__/g, escapedSharpRegExp = /\\#/g, sharpRegExp = /__SHARP__/g, zeros = [
                '',
                '0',
                '00',
                '000',
                '0000'
            ];
        Template = {
            paramName: 'data',
            useWithBlock: true,
            render: function (template, data) {
                var idx, length, html = '';
                for (idx = 0, length = data.length; idx < length; idx++) {
                    html += template(data[idx]);
                }
                return html;
            },
            compile: function (template, options) {
                var settings = extend({}, this, options), paramName = settings.paramName, argumentName = paramName.match(argumentNameRegExp)[0], useWithBlock = settings.useWithBlock, functionBody = 'var $quiltOutput, $quiltHtmlEncode = quilt.htmlEncode;', fn, parts, idx;
                if (isFunction(template)) {
                    return template;
                }
                functionBody += useWithBlock ? 'with(' + paramName + '){' : '';
                functionBody += '$quiltOutput=';
                parts = template.replace(escapedCurlyRegExp, '__CURLY__').replace(encodeRegExp, '#=$quiltHtmlEncode($1)#').replace(curlyRegExp, '}').replace(escapedSharpRegExp, '__SHARP__').split('#');
                for (idx = 0; idx < parts.length; idx++) {
                    functionBody += compilePart(parts[idx], idx % 2 === 0);
                }
                functionBody += useWithBlock ? ';}' : ';';
                functionBody += 'return $quiltOutput;';
                functionBody = functionBody.replace(sharpRegExp, '#');
                try {
                    fn = new Function(argumentName, functionBody);
                    fn._slotCount = Math.floor(parts.length / 2);
                    return fn;
                } catch (e) {
                    throw new Error(quilt.format('Invalid template:\'{0}\' Generated code:\'{1}\'', template, functionBody));
                }
            }
        };
        function pad(number, digits, end) {
            number = number + '';
            digits = digits || 2;
            end = digits - number.length;
            if (end) {
                return zeros[digits].substring(0, end) + number;
            }
            return number;
        }
        (function () {
            var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta = {
                    '\b': '\\b',
                    '\t': '\\t',
                    '\n': '\\n',
                    '\f': '\\f',
                    '\r': '\\r',
                    '"': '\\"',
                    '\\': '\\\\'
                }, rep, toString = {}.toString;
            if (typeof Date.prototype.toJSON !== FUNCTION) {
                Date.prototype.toJSON = function () {
                    var that = this;
                    return isFinite(that.valueOf()) ? pad(that.getUTCFullYear(), 4) + '-' + pad(that.getUTCMonth() + 1) + '-' + pad(that.getUTCDate()) + 'T' + pad(that.getUTCHours()) + ':' + pad(that.getUTCMinutes()) + ':' + pad(that.getUTCSeconds()) + 'Z' : null;
                };
                String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function () {
                    return this.valueOf();
                };
            }
            function quote(string) {
                escapable.lastIndex = 0;
                return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                    var c = meta[a];
                    return typeof c === STRING ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                }) + '"' : '"' + string + '"';
            }
            function str(key, holder) {
                var i, k, v, length, mind = gap, partial, value = holder[key], type;
                if (value && typeof value === OBJECT && typeof value.toJSON === FUNCTION) {
                    value = value.toJSON(key);
                }
                if (typeof rep === FUNCTION) {
                    value = rep.call(holder, key, value);
                }
                type = typeof value;
                if (type === STRING) {
                    return quote(value);
                } else if (type === NUMBER) {
                    return isFinite(value) ? String(value) : NULL;
                } else if (type === BOOLEAN || type === NULL) {
                    return String(value);
                } else if (type === OBJECT) {
                    if (!value) {
                        return NULL;
                    }
                    gap += indent;
                    partial = [];
                    if (toString.apply(value) === '[object Array]') {
                        length = value.length;
                        for (i = 0; i < length; i++) {
                            partial[i] = str(i, value) || NULL;
                        }
                        v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
                        gap = mind;
                        return v;
                    }
                    if (rep && typeof rep === OBJECT) {
                        length = rep.length;
                        for (i = 0; i < length; i++) {
                            if (typeof rep[i] === STRING) {
                                k = rep[i];
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    } else {
                        for (k in value) {
                            if (Object.hasOwnProperty.call(value, k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    }
                    v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
                    gap = mind;
                    return v;
                }
            }
            if (typeof JSON.stringify !== FUNCTION) {
                JSON.stringify = function (value, replacer, space) {
                    var i;
                    gap = '';
                    indent = '';
                    if (typeof space === NUMBER) {
                        for (i = 0; i < space; i += 1) {
                            indent += ' ';
                        }
                    } else if (typeof space === STRING) {
                        indent = space;
                    }
                    rep = replacer;
                    if (replacer && typeof replacer !== FUNCTION && (typeof replacer !== OBJECT || typeof replacer.length !== NUMBER)) {
                        throw new Error('JSON.stringify');
                    }
                    return str('', { '': value });
                };
            }
        }());
        (function () {
            var dateFormatRegExp = /dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|HH|H|hh|h|mm|m|fff|ff|f|tt|ss|s|zzz|zz|z|"[^"]*"|'[^']*'/g, standardFormatRegExp = /^(n|c|p|e)(\d*)$/i, literalRegExp = /(\\.)|(['][^']*[']?)|(["][^"]*["]?)/g, commaRegExp = /\,/g, EMPTY = '', POINT = '.', COMMA = ',', SHARP = '#', ZERO = '0', PLACEHOLDER = '??', EN = 'en-US', objectToString = {}.toString;
            quilt.cultures['en-US'] = {
                name: EN,
                numberFormat: {
                    pattern: ['-n'],
                    decimals: 2,
                    ',': ',',
                    '.': '.',
                    groupSize: [3],
                    percent: {
                        pattern: [
                            '-n %',
                            'n %'
                        ],
                        decimals: 2,
                        ',': ',',
                        '.': '.',
                        groupSize: [3],
                        symbol: '%'
                    },
                    currency: {
                        name: 'US Dollar',
                        abbr: 'USD',
                        pattern: [
                            '($n)',
                            '$n'
                        ],
                        decimals: 2,
                        ',': ',',
                        '.': '.',
                        groupSize: [3],
                        symbol: '$'
                    }
                },
                calendars: {
                    standard: {
                        days: {
                            names: [
                                'Sunday',
                                'Monday',
                                'Tuesday',
                                'Wednesday',
                                'Thursday',
                                'Friday',
                                'Saturday'
                            ],
                            namesAbbr: [
                                'Sun',
                                'Mon',
                                'Tue',
                                'Wed',
                                'Thu',
                                'Fri',
                                'Sat'
                            ],
                            namesShort: [
                                'Su',
                                'Mo',
                                'Tu',
                                'We',
                                'Th',
                                'Fr',
                                'Sa'
                            ]
                        },
                        months: {
                            names: [
                                'January',
                                'February',
                                'March',
                                'April',
                                'May',
                                'June',
                                'July',
                                'August',
                                'September',
                                'October',
                                'November',
                                'December'
                            ],
                            namesAbbr: [
                                'Jan',
                                'Feb',
                                'Mar',
                                'Apr',
                                'May',
                                'Jun',
                                'Jul',
                                'Aug',
                                'Sep',
                                'Oct',
                                'Nov',
                                'Dec'
                            ]
                        },
                        AM: [
                            'AM',
                            'am',
                            'AM'
                        ],
                        PM: [
                            'PM',
                            'pm',
                            'PM'
                        ],
                        patterns: {
                            d: 'M/d/yyyy',
                            D: 'dddd, MMMM dd, yyyy',
                            F: 'dddd, MMMM dd, yyyy h:mm:ss tt',
                            g: 'M/d/yyyy h:mm tt',
                            G: 'M/d/yyyy h:mm:ss tt',
                            m: 'MMMM dd',
                            M: 'MMMM dd',
                            s: 'yyyy\'-\'MM\'-\'ddTHH\':\'mm\':\'ss',
                            t: 'h:mm tt',
                            T: 'h:mm:ss tt',
                            u: 'yyyy\'-\'MM\'-\'dd HH\':\'mm\':\'ss\'Z\'',
                            y: 'MMMM, yyyy',
                            Y: 'MMMM, yyyy'
                        },
                        '/': '/',
                        ':': ':',
                        firstDay: 0,
                        twoDigitYearMax: 2029
                    }
                }
            };
            function findCulture(culture) {
                if (culture) {
                    if (culture.numberFormat) {
                        return culture;
                    }
                    if (typeof culture === STRING) {
                        var cultures = quilt.cultures;
                        return cultures[culture] || cultures[culture.split('-')[0]] || null;
                    }
                    return null;
                }
                return null;
            }
            function getCulture(culture) {
                if (culture) {
                    culture = findCulture(culture);
                }
                return culture || quilt.cultures.current;
            }
            quilt.culture = function (cultureName) {
                var cultures = quilt.cultures, culture;
                if (cultureName !== undefined) {
                    culture = findCulture(cultureName) || cultures[EN];
                    culture.calendar = culture.calendars.standard;
                    cultures.current = culture;
                } else {
                    return cultures.current;
                }
            };
            quilt.findCulture = findCulture;
            quilt.getCulture = getCulture;
            quilt.culture(EN);
            function formatDate(date, format, culture) {
                culture = getCulture(culture);
                var calendar = culture.calendars.standard, days = calendar.days, months = calendar.months;
                format = calendar.patterns[format] || format;
                return format.replace(dateFormatRegExp, function (match) {
                    var minutes;
                    var result;
                    var sign;
                    if (match === 'd') {
                        result = date.getDate();
                    } else if (match === 'dd') {
                        result = pad(date.getDate());
                    } else if (match === 'ddd') {
                        result = days.namesAbbr[date.getDay()];
                    } else if (match === 'dddd') {
                        result = days.names[date.getDay()];
                    } else if (match === 'M') {
                        result = date.getMonth() + 1;
                    } else if (match === 'MM') {
                        result = pad(date.getMonth() + 1);
                    } else if (match === 'MMM') {
                        result = months.namesAbbr[date.getMonth()];
                    } else if (match === 'MMMM') {
                        result = months.names[date.getMonth()];
                    } else if (match === 'yy') {
                        result = pad(date.getFullYear() % 100);
                    } else if (match === 'yyyy') {
                        result = pad(date.getFullYear(), 4);
                    } else if (match === 'h') {
                        result = date.getHours() % 12 || 12;
                    } else if (match === 'hh') {
                        result = pad(date.getHours() % 12 || 12);
                    } else if (match === 'H') {
                        result = date.getHours();
                    } else if (match === 'HH') {
                        result = pad(date.getHours());
                    } else if (match === 'm') {
                        result = date.getMinutes();
                    } else if (match === 'mm') {
                        result = pad(date.getMinutes());
                    } else if (match === 's') {
                        result = date.getSeconds();
                    } else if (match === 'ss') {
                        result = pad(date.getSeconds());
                    } else if (match === 'f') {
                        result = math.floor(date.getMilliseconds() / 100);
                    } else if (match === 'ff') {
                        result = date.getMilliseconds();
                        if (result > 99) {
                            result = math.floor(result / 10);
                        }
                        result = pad(result);
                    } else if (match === 'fff') {
                        result = pad(date.getMilliseconds(), 3);
                    } else if (match === 'tt') {
                        result = date.getHours() < 12 ? calendar.AM[0] : calendar.PM[0];
                    } else if (match === 'zzz') {
                        minutes = date.getTimezoneOffset();
                        sign = minutes < 0;
                        result = math.abs(minutes / 60).toString().split('.')[0];
                        minutes = math.abs(minutes) - result * 60;
                        result = (sign ? '+' : '-') + pad(result);
                        result += ':' + pad(minutes);
                    } else if (match === 'zz' || match === 'z') {
                        result = date.getTimezoneOffset() / 60;
                        sign = result < 0;
                        result = math.abs(result).toString().split('.')[0];
                        result = (sign ? '+' : '-') + (match === 'zz' ? pad(result) : result);
                    }
                    return result !== undefined ? result : match.slice(1, match.length - 1);
                });
            }
            function formatNumber(number, format, culture) {
                culture = getCulture(culture);
                var numberFormat = culture.numberFormat, decimal = numberFormat[POINT], precision = numberFormat.decimals, pattern = numberFormat.pattern[0], literals = [], symbol, isCurrency, isPercent, customPrecision, formatAndPrecision, negative = number < 0, integer, fraction, integerLength, fractionLength, replacement = EMPTY, value = EMPTY, idx, length, ch, hasGroup, hasNegativeFormat, decimalIndex, sharpIndex, zeroIndex, hasZero, hasSharp, percentIndex, currencyIndex, startZeroIndex, start = -1, end;
                if (number === undefined) {
                    return EMPTY;
                }
                if (!isFinite(number)) {
                    return number;
                }
                if (!format) {
                    return culture.name.length ? number.toLocaleString() : number.toString();
                }
                formatAndPrecision = standardFormatRegExp.exec(format);
                if (formatAndPrecision) {
                    format = formatAndPrecision[1].toLowerCase();
                    isCurrency = format === 'c';
                    isPercent = format === 'p';
                    if (isCurrency || isPercent) {
                        numberFormat = isCurrency ? numberFormat.currency : numberFormat.percent;
                        decimal = numberFormat[POINT];
                        precision = numberFormat.decimals;
                        symbol = numberFormat.symbol;
                        pattern = numberFormat.pattern[negative ? 0 : 1];
                    }
                    customPrecision = formatAndPrecision[2];
                    if (customPrecision) {
                        precision = +customPrecision;
                    }
                    if (format === 'e') {
                        var exp = customPrecision ? number.toExponential(precision) : number.toExponential();
                        return exp.replace(POINT, numberFormat[POINT]);
                    }
                    if (isPercent) {
                        number *= 100;
                    }
                    number = round(number, precision);
                    negative = number < 0;
                    number = number.split(POINT);
                    integer = number[0];
                    fraction = number[1];
                    if (negative) {
                        integer = integer.substring(1);
                    }
                    value = groupInteger(integer, 0, integer.length, numberFormat);
                    if (fraction) {
                        value += decimal + fraction;
                    }
                    if (format === 'n' && !negative) {
                        return value;
                    }
                    number = EMPTY;
                    for (idx = 0, length = pattern.length; idx < length; idx++) {
                        ch = pattern.charAt(idx);
                        if (ch === 'n') {
                            number += value;
                        } else if (ch === '$' || ch === '%') {
                            number += symbol;
                        } else {
                            number += ch;
                        }
                    }
                    return number;
                }
                if (format.indexOf('\'') > -1 || format.indexOf('"') > -1 || format.indexOf('\\') > -1) {
                    format = format.replace(literalRegExp, function (match) {
                        var quoteChar = match.charAt(0).replace('\\', ''), literal = match.slice(1).replace(quoteChar, '');
                        literals.push(literal);
                        return PLACEHOLDER;
                    });
                }
                format = format.split(';');
                if (negative && format[1]) {
                    format = format[1];
                    hasNegativeFormat = true;
                } else if (number === 0 && format[2]) {
                    format = format[2];
                    if (format.indexOf(SHARP) == -1 && format.indexOf(ZERO) == -1) {
                        return format;
                    }
                } else {
                    format = format[0];
                }
                percentIndex = format.indexOf('%');
                currencyIndex = format.indexOf('$');
                isPercent = percentIndex != -1;
                isCurrency = currencyIndex != -1;
                if (isPercent) {
                    number *= 100;
                }
                if (isCurrency && format[currencyIndex - 1] === '\\') {
                    format = format.split('\\').join('');
                    isCurrency = false;
                }
                if (isCurrency || isPercent) {
                    numberFormat = isCurrency ? numberFormat.currency : numberFormat.percent;
                    decimal = numberFormat[POINT];
                    precision = numberFormat.decimals;
                    symbol = numberFormat.symbol;
                }
                hasGroup = format.indexOf(COMMA) > -1;
                if (hasGroup) {
                    format = format.replace(commaRegExp, EMPTY);
                }
                decimalIndex = format.indexOf(POINT);
                length = format.length;
                if (decimalIndex != -1) {
                    fraction = number.toString().split('e');
                    if (fraction[1]) {
                        fraction = round(number, Math.abs(fraction[1]));
                    } else {
                        fraction = fraction[0];
                    }
                    fraction = fraction.split(POINT)[1] || EMPTY;
                    zeroIndex = format.lastIndexOf(ZERO) - decimalIndex;
                    sharpIndex = format.lastIndexOf(SHARP) - decimalIndex;
                    hasZero = zeroIndex > -1;
                    hasSharp = sharpIndex > -1;
                    idx = fraction.length;
                    if (!hasZero && !hasSharp) {
                        format = format.substring(0, decimalIndex) + format.substring(decimalIndex + 1);
                        length = format.length;
                        decimalIndex = -1;
                        idx = 0;
                    }
                    if (hasZero && zeroIndex > sharpIndex) {
                        idx = zeroIndex;
                    } else if (sharpIndex > zeroIndex) {
                        if (hasSharp && idx > sharpIndex) {
                            var rounded = round(number, sharpIndex, negative);
                            while (rounded.charAt(rounded.length - 1) === ZERO && sharpIndex > 0 && sharpIndex > zeroIndex) {
                                sharpIndex--;
                                rounded = round(number, sharpIndex, negative);
                            }
                            idx = sharpIndex;
                        } else if (hasZero && idx < zeroIndex) {
                            idx = zeroIndex;
                        }
                    }
                }
                number = round(number, idx, negative);
                sharpIndex = format.indexOf(SHARP);
                startZeroIndex = zeroIndex = format.indexOf(ZERO);
                if (sharpIndex == -1 && zeroIndex != -1) {
                    start = zeroIndex;
                } else if (sharpIndex != -1 && zeroIndex == -1) {
                    start = sharpIndex;
                } else {
                    start = sharpIndex > zeroIndex ? zeroIndex : sharpIndex;
                }
                sharpIndex = format.lastIndexOf(SHARP);
                zeroIndex = format.lastIndexOf(ZERO);
                if (sharpIndex == -1 && zeroIndex != -1) {
                    end = zeroIndex;
                } else if (sharpIndex != -1 && zeroIndex == -1) {
                    end = sharpIndex;
                } else {
                    end = sharpIndex > zeroIndex ? sharpIndex : zeroIndex;
                }
                if (start == length) {
                    end = start;
                }
                if (start != -1) {
                    value = number.toString().split(POINT);
                    integer = value[0];
                    fraction = value[1] || EMPTY;
                    integerLength = integer.length;
                    fractionLength = fraction.length;
                    if (negative && number * -1 >= 0) {
                        negative = false;
                    }
                    number = format.substring(0, start);
                    if (negative && !hasNegativeFormat) {
                        number += '-';
                    }
                    for (idx = start; idx < length; idx++) {
                        ch = format.charAt(idx);
                        if (decimalIndex == -1) {
                            if (end - idx < integerLength) {
                                number += integer;
                                break;
                            }
                        } else {
                            if (zeroIndex != -1 && zeroIndex < idx) {
                                replacement = EMPTY;
                            }
                            if (decimalIndex - idx <= integerLength && decimalIndex - idx > -1) {
                                number += integer;
                                idx = decimalIndex;
                            }
                            if (decimalIndex === idx) {
                                number += (fraction ? decimal : EMPTY) + fraction;
                                idx += end - decimalIndex + 1;
                                continue;
                            }
                        }
                        if (ch === ZERO) {
                            number += ch;
                            replacement = ch;
                        } else if (ch === SHARP) {
                            number += replacement;
                        }
                    }
                    if (hasGroup) {
                        number = groupInteger(number, start + (negative && !hasNegativeFormat ? 1 : 0), Math.max(end, integerLength + start), numberFormat);
                    }
                    if (end >= start) {
                        number += format.substring(end + 1);
                    }
                    if (isCurrency || isPercent) {
                        value = EMPTY;
                        for (idx = 0, length = number.length; idx < length; idx++) {
                            ch = number.charAt(idx);
                            value += ch === '$' || ch === '%' ? symbol : ch;
                        }
                        number = value;
                    }
                    length = literals.length;
                    if (length) {
                        for (idx = 0; idx < length; idx++) {
                            number = number.replace(PLACEHOLDER, literals[idx]);
                        }
                    }
                }
                return number;
            }
            var groupInteger = function (number, start, end, numberFormat) {
                var decimalIndex = number.indexOf(numberFormat[POINT]);
                var groupSizes = numberFormat.groupSize.slice();
                var groupSize = groupSizes.shift();
                var integer, integerLength;
                var idx, parts, value;
                var newGroupSize;
                end = decimalIndex !== -1 ? decimalIndex : end + 1;
                integer = number.substring(start, end);
                integerLength = integer.length;
                if (integerLength >= groupSize) {
                    idx = integerLength;
                    parts = [];
                    while (idx > -1) {
                        value = integer.substring(idx - groupSize, idx);
                        if (value) {
                            parts.push(value);
                        }
                        idx -= groupSize;
                        newGroupSize = groupSizes.shift();
                        groupSize = newGroupSize !== undefined ? newGroupSize : groupSize;
                        if (groupSize === 0) {
                            if (idx > 0) {
                                parts.push(integer.substring(0, idx));
                            }
                            break;
                        }
                    }
                    integer = parts.reverse().join(numberFormat[COMMA]);
                    number = number.substring(0, start) + integer + number.substring(end);
                }
                return number;
            };
            var round = function (value, precision, negative) {
                precision = precision || 0;
                value = value.toString().split('e');
                value = Math.round(+(value[0] + 'e' + (value[1] ? +value[1] + precision : precision)));
                if (negative) {
                    value = -value;
                }
                value = value.toString().split('e');
                value = +(value[0] + 'e' + (value[1] ? +value[1] - precision : -precision));
                return value.toFixed(Math.min(precision, 20));
            };
            var toString = function (value, fmt, culture) {
                if (fmt) {
                    if (objectToString.call(value) === '[object Date]') {
                        return formatDate(value, fmt, culture);
                    } else if (typeof value === NUMBER) {
                        return formatNumber(value, fmt, culture);
                    }
                }
                return value !== undefined ? value : '';
            };
            quilt.format = function (fmt) {
                var values = arguments;
                return fmt.replace(formatRegExp, function (match, index, placeholderFormat) {
                    var value = values[parseInt(index, 10) + 1];
                    return toString(value, placeholderFormat ? placeholderFormat.substring(1) : '');
                });
            };
            quilt._extractFormat = function (format) {
                if (format.slice(0, 3) === '{0:') {
                    format = format.slice(3, format.length - 1);
                }
                return format;
            };
            quilt._activeElement = function () {
                try {
                    return document.activeElement;
                } catch (e) {
                    return document.documentElement.activeElement;
                }
            };
            quilt._round = round;
            quilt._outerWidth = function (element, includeMargin) {
                return $(element).outerWidth(includeMargin || false) || 0;
            };
            quilt._outerHeight = function (element, includeMargin) {
                return $(element).outerHeight(includeMargin || false) || 0;
            };
            quilt.toString = toString;
        }());
        (function () {
            var nonBreakingSpaceRegExp = /\u00A0/g, exponentRegExp = /[eE][\-+]?[0-9]+/, shortTimeZoneRegExp = /[+|\-]\d{1,2}/, longTimeZoneRegExp = /[+|\-]\d{1,2}:?\d{2}/, dateRegExp = /^\/Date\((.*?)\)\/$/, offsetRegExp = /[+-]\d*/, FORMATS_SEQUENCE = [
                    [],
                    [
                        'G',
                        'g',
                        'F'
                    ],
                    [
                        'D',
                        'd',
                        'y',
                        'm',
                        'T',
                        't'
                    ]
                ], STANDARD_FORMATS = [
                    [
                        'yyyy-MM-ddTHH:mm:ss.fffffffzzz',
                        'yyyy-MM-ddTHH:mm:ss.fffffff',
                        'yyyy-MM-ddTHH:mm:ss.fffzzz',
                        'yyyy-MM-ddTHH:mm:ss.fff',
                        'ddd MMM dd yyyy HH:mm:ss',
                        'yyyy-MM-ddTHH:mm:sszzz',
                        'yyyy-MM-ddTHH:mmzzz',
                        'yyyy-MM-ddTHH:mmzz',
                        'yyyy-MM-ddTHH:mm:ss',
                        'yyyy-MM-dd HH:mm:ss',
                        'yyyy/MM/dd HH:mm:ss'
                    ],
                    [
                        'yyyy-MM-ddTHH:mm',
                        'yyyy-MM-dd HH:mm',
                        'yyyy/MM/dd HH:mm'
                    ],
                    [
                        'yyyy/MM/dd',
                        'yyyy-MM-dd',
                        'HH:mm:ss',
                        'HH:mm'
                    ]
                ], numberRegExp = {
                    2: /^\d{1,2}/,
                    3: /^\d{1,3}/,
                    4: /^\d{4}/
                }, objectToString = {}.toString;
            function outOfRange(value, start, end) {
                return !(value >= start && value <= end);
            }
            function designatorPredicate(designator) {
                return designator.charAt(0);
            }
            function mapDesignators(designators) {
                return $.map(designators, designatorPredicate);
            }
            function adjustDST(date, hours) {
                if (!hours && date.getHours() === 23) {
                    date.setHours(date.getHours() + 2);
                }
            }
            function lowerArray(data) {
                var idx = 0, length = data.length, array = [];
                for (; idx < length; idx++) {
                    array[idx] = (data[idx] + '').toLowerCase();
                }
                return array;
            }
            function lowerLocalInfo(localInfo) {
                var newLocalInfo = {}, property;
                for (property in localInfo) {
                    newLocalInfo[property] = lowerArray(localInfo[property]);
                }
                return newLocalInfo;
            }
            function parseExact(value, format, culture, strict) {
                if (!value) {
                    return null;
                }
                var lookAhead = function (match) {
                        var i = 0;
                        while (format[idx] === match) {
                            i++;
                            idx++;
                        }
                        if (i > 0) {
                            idx -= 1;
                        }
                        return i;
                    }, getNumber = function (size) {
                        var rg = numberRegExp[size] || new RegExp('^\\d{1,' + size + '}'), match = value.substr(valueIdx, size).match(rg);
                        if (match) {
                            match = match[0];
                            valueIdx += match.length;
                            return parseInt(match, 10);
                        }
                        return null;
                    }, getIndexByName = function (names, lower) {
                        var i = 0, length = names.length, name, nameLength, matchLength = 0, matchIdx = 0, subValue;
                        for (; i < length; i++) {
                            name = names[i];
                            nameLength = name.length;
                            subValue = value.substr(valueIdx, nameLength);
                            if (lower) {
                                subValue = subValue.toLowerCase();
                            }
                            if (subValue == name && nameLength > matchLength) {
                                matchLength = nameLength;
                                matchIdx = i;
                            }
                        }
                        if (matchLength) {
                            valueIdx += matchLength;
                            return matchIdx + 1;
                        }
                        return null;
                    }, checkLiteral = function () {
                        var result = false;
                        if (value.charAt(valueIdx) === format[idx]) {
                            valueIdx++;
                            result = true;
                        }
                        return result;
                    }, calendar = culture.calendars.standard, year = null, month = null, day = null, hours = null, minutes = null, seconds = null, milliseconds = null, idx = 0, valueIdx = 0, literal = false, date = new Date(), twoDigitYearMax = calendar.twoDigitYearMax || 2029, defaultYear = date.getFullYear(), ch, count, length, pattern, pmHour, UTC, matches, amDesignators, pmDesignators, hoursOffset, minutesOffset, hasTime, match;
                if (!format) {
                    format = 'd';
                }
                pattern = calendar.patterns[format];
                if (pattern) {
                    format = pattern;
                }
                format = format.split('');
                length = format.length;
                for (; idx < length; idx++) {
                    ch = format[idx];
                    if (literal) {
                        if (ch === '\'') {
                            literal = false;
                        } else {
                            checkLiteral();
                        }
                    } else {
                        if (ch === 'd') {
                            count = lookAhead('d');
                            if (!calendar._lowerDays) {
                                calendar._lowerDays = lowerLocalInfo(calendar.days);
                            }
                            if (day !== null && count > 2) {
                                continue;
                            }
                            day = count < 3 ? getNumber(2) : getIndexByName(calendar._lowerDays[count == 3 ? 'namesAbbr' : 'names'], true);
                            if (day === null || outOfRange(day, 1, 31)) {
                                return null;
                            }
                        } else if (ch === 'M') {
                            count = lookAhead('M');
                            if (!calendar._lowerMonths) {
                                calendar._lowerMonths = lowerLocalInfo(calendar.months);
                            }
                            month = count < 3 ? getNumber(2) : getIndexByName(calendar._lowerMonths[count == 3 ? 'namesAbbr' : 'names'], true);
                            if (month === null || outOfRange(month, 1, 12)) {
                                return null;
                            }
                            month -= 1;
                        } else if (ch === 'y') {
                            count = lookAhead('y');
                            year = getNumber(count);
                            if (year === null) {
                                return null;
                            }
                            if (count == 2) {
                                if (typeof twoDigitYearMax === 'string') {
                                    twoDigitYearMax = defaultYear + parseInt(twoDigitYearMax, 10);
                                }
                                year = defaultYear - defaultYear % 100 + year;
                                if (year > twoDigitYearMax) {
                                    year -= 100;
                                }
                            }
                        } else if (ch === 'h') {
                            lookAhead('h');
                            hours = getNumber(2);
                            if (hours == 12) {
                                hours = 0;
                            }
                            if (hours === null || outOfRange(hours, 0, 11)) {
                                return null;
                            }
                        } else if (ch === 'H') {
                            lookAhead('H');
                            hours = getNumber(2);
                            if (hours === null || outOfRange(hours, 0, 23)) {
                                return null;
                            }
                        } else if (ch === 'm') {
                            lookAhead('m');
                            minutes = getNumber(2);
                            if (minutes === null || outOfRange(minutes, 0, 59)) {
                                return null;
                            }
                        } else if (ch === 's') {
                            lookAhead('s');
                            seconds = getNumber(2);
                            if (seconds === null || outOfRange(seconds, 0, 59)) {
                                return null;
                            }
                        } else if (ch === 'f') {
                            count = lookAhead('f');
                            match = value.substr(valueIdx, count).match(numberRegExp[3]);
                            milliseconds = getNumber(count);
                            if (milliseconds !== null) {
                                milliseconds = parseFloat('0.' + match[0], 10);
                                milliseconds = quilt._round(milliseconds, 3);
                                milliseconds *= 1000;
                            }
                            if (milliseconds === null || outOfRange(milliseconds, 0, 999)) {
                                return null;
                            }
                        } else if (ch === 't') {
                            count = lookAhead('t');
                            amDesignators = calendar.AM;
                            pmDesignators = calendar.PM;
                            if (count === 1) {
                                amDesignators = mapDesignators(amDesignators);
                                pmDesignators = mapDesignators(pmDesignators);
                            }
                            pmHour = getIndexByName(pmDesignators);
                            if (!pmHour && !getIndexByName(amDesignators)) {
                                return null;
                            }
                        } else if (ch === 'z') {
                            UTC = true;
                            count = lookAhead('z');
                            if (value.substr(valueIdx, 1) === 'Z') {
                                checkLiteral();
                                continue;
                            }
                            matches = value.substr(valueIdx, 6).match(count > 2 ? longTimeZoneRegExp : shortTimeZoneRegExp);
                            if (!matches) {
                                return null;
                            }
                            matches = matches[0].split(':');
                            hoursOffset = matches[0];
                            minutesOffset = matches[1];
                            if (!minutesOffset && hoursOffset.length > 3) {
                                valueIdx = hoursOffset.length - 2;
                                minutesOffset = hoursOffset.substring(valueIdx);
                                hoursOffset = hoursOffset.substring(0, valueIdx);
                            }
                            hoursOffset = parseInt(hoursOffset, 10);
                            if (outOfRange(hoursOffset, -12, 13)) {
                                return null;
                            }
                            if (count > 2) {
                                minutesOffset = matches[0][0] + minutesOffset;
                                minutesOffset = parseInt(minutesOffset, 10);
                                if (isNaN(minutesOffset) || outOfRange(minutesOffset, -59, 59)) {
                                    return null;
                                }
                            }
                        } else if (ch === '\'') {
                            literal = true;
                            checkLiteral();
                        } else if (!checkLiteral()) {
                            return null;
                        }
                    }
                }
                if (strict && !/^\s*$/.test(value.substr(valueIdx))) {
                    return null;
                }
                hasTime = hours !== null || minutes !== null || seconds || null;
                if (year === null && month === null && day === null && hasTime) {
                    year = defaultYear;
                    month = date.getMonth();
                    day = date.getDate();
                } else {
                    if (year === null) {
                        year = defaultYear;
                    }
                    if (day === null) {
                        day = 1;
                    }
                }
                if (pmHour && hours < 12) {
                    hours += 12;
                }
                if (UTC) {
                    if (hoursOffset) {
                        hours += -hoursOffset;
                    }
                    if (minutesOffset) {
                        minutes += -minutesOffset;
                    }
                    value = new Date(Date.UTC(year, month, day, hours, minutes, seconds, milliseconds));
                } else {
                    value = new Date(year, month, day, hours, minutes, seconds, milliseconds);
                    adjustDST(value, hours);
                }
                if (year < 100) {
                    value.setFullYear(year);
                }
                if (value.getDate() !== day && UTC === undefined) {
                    return null;
                }
                return value;
            }
            function parseMicrosoftFormatOffset(offset) {
                var sign = offset.substr(0, 1) === '-' ? -1 : 1;
                offset = offset.substring(1);
                offset = parseInt(offset.substr(0, 2), 10) * 60 + parseInt(offset.substring(2), 10);
                return sign * offset;
            }
            function getDefaultFormats(culture) {
                var length = math.max(FORMATS_SEQUENCE.length, STANDARD_FORMATS.length);
                var calendar = culture.calendar || culture.calendars.standard;
                var patterns = calendar.patterns;
                var cultureFormats, formatIdx, idx;
                var formats = [];
                for (idx = 0; idx < length; idx++) {
                    cultureFormats = FORMATS_SEQUENCE[idx];
                    for (formatIdx = 0; formatIdx < cultureFormats.length; formatIdx++) {
                        formats.push(patterns[cultureFormats[formatIdx]]);
                    }
                    formats = formats.concat(STANDARD_FORMATS[idx]);
                }
                return formats;
            }
            function internalParseDate(value, formats, culture, strict) {
                if (objectToString.call(value) === '[object Date]') {
                    return value;
                }
                var idx = 0;
                var date = null;
                var length;
                var tzoffset;
                if (value && value.indexOf('/D') === 0) {
                    date = dateRegExp.exec(value);
                    if (date) {
                        date = date[1];
                        tzoffset = offsetRegExp.exec(date.substring(1));
                        date = new Date(parseInt(date, 10));
                        if (tzoffset) {
                            tzoffset = parseMicrosoftFormatOffset(tzoffset[0]);
                            date = quilt.timezone.apply(date, 0);
                            date = quilt.timezone.convert(date, 0, -1 * tzoffset);
                        }
                        return date;
                    }
                }
                culture = quilt.getCulture(culture);
                if (!formats) {
                    formats = getDefaultFormats(culture);
                }
                formats = isArray(formats) ? formats : [formats];
                length = formats.length;
                for (; idx < length; idx++) {
                    date = parseExact(value, formats[idx], culture, strict);
                    if (date) {
                        return date;
                    }
                }
                return date;
            }
            quilt.parseDate = function (value, formats, culture) {
                return internalParseDate(value, formats, culture, false);
            };
            quilt.parseExactDate = function (value, formats, culture) {
                return internalParseDate(value, formats, culture, true);
            };
            quilt.parseInt = function (value, culture) {
                var result = quilt.parseFloat(value, culture);
                if (result) {
                    result = result | 0;
                }
                return result;
            };
            quilt.parseFloat = function (value, culture, format) {
                if (!value && value !== 0) {
                    return null;
                }
                if (typeof value === NUMBER) {
                    return value;
                }
                value = value.toString();
                culture = quilt.getCulture(culture);
                var number = culture.numberFormat, percent = number.percent, currency = number.currency, symbol = currency.symbol, percentSymbol = percent.symbol, negative = value.indexOf('-'), parts, isPercent;
                if (exponentRegExp.test(value)) {
                    value = parseFloat(value.replace(number['.'], '.'));
                    if (isNaN(value)) {
                        value = null;
                    }
                    return value;
                }
                if (negative > 0) {
                    return null;
                } else {
                    negative = negative > -1;
                }
                if (value.indexOf(symbol) > -1 || format && format.toLowerCase().indexOf('c') > -1) {
                    number = currency;
                    parts = number.pattern[0].replace('$', symbol).split('n');
                    if (value.indexOf(parts[0]) > -1 && value.indexOf(parts[1]) > -1) {
                        value = value.replace(parts[0], '').replace(parts[1], '');
                        negative = true;
                    }
                } else if (value.indexOf(percentSymbol) > -1) {
                    isPercent = true;
                    number = percent;
                    symbol = percentSymbol;
                }
                value = value.replace('-', '').replace(symbol, '').replace(nonBreakingSpaceRegExp, ' ').split(number[','].replace(nonBreakingSpaceRegExp, ' ')).join('').replace(number['.'], '.');
                value = parseFloat(value);
                if (isNaN(value)) {
                    value = null;
                } else if (negative) {
                    value *= -1;
                }
                if (value && isPercent) {
                    value /= 100;
                }
                return value;
            };
        }());
        function getShadows(element) {
            var shadow = element.css(quilt.support.transitions.css + 'box-shadow') || element.css('box-shadow'), radius = shadow ? shadow.match(boxShadowRegExp) || [
                    0,
                    0,
                    0,
                    0,
                    0
                ] : [
                    0,
                    0,
                    0,
                    0,
                    0
                ], blur = math.max(+radius[3], +(radius[4] || 0));
            return {
                left: -radius[1] + blur,
                right: +radius[1] + blur,
                bottom: +radius[2] + blur
            };
        }
        function wrap(element, autosize) {
            var percentage, outerWidth = quilt._outerWidth, outerHeight = quilt._outerHeight, parent = element.parent(), windowOuterWidth = outerWidth(window);
            parent.removeClass('k-animation-container-sm');
            if (!parent.hasClass('k-animation-container')) {
                var width = element[0].style.width, height = element[0].style.height, percentWidth = percentRegExp.test(width), percentHeight = percentRegExp.test(height), forceWidth = element.hasClass('k-tooltip') || element.is('.k-menu-horizontal.k-context-menu');
                percentage = percentWidth || percentHeight;
                if (!percentWidth && (!autosize || autosize && width || forceWidth)) {
                    width = autosize ? outerWidth(element) + 1 : outerWidth(element);
                }
                if (!percentHeight && (!autosize || autosize && height) || element.is('.k-menu-horizontal.k-context-menu')) {
                    height = outerHeight(element);
                }
                element.wrap($('<div/>').addClass('k-animation-container').css({
                    width: width,
                    height: height
                }));
                parent = element.parent();
                if (percentage) {
                    element.css({
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box',
                        mozBoxSizing: 'border-box',
                        webkitBoxSizing: 'border-box'
                    });
                }
            } else {
                wrapResize(element, autosize);
            }
            if (windowOuterWidth < outerWidth(parent)) {
                parent.addClass('k-animation-container-sm');
                wrapResize(element, autosize);
            }
            return parent;
        }
        function wrapResize(element, autosize) {
            var percentage, outerWidth = quilt._outerWidth, outerHeight = quilt._outerHeight, wrapper = element.parent('.k-animation-container'), wrapperStyle = wrapper[0].style;
            if (wrapper.is(':hidden')) {
                wrapper.css({
                    display: '',
                    position: ''
                });
            }
            percentage = percentRegExp.test(wrapperStyle.width) || percentRegExp.test(wrapperStyle.height);
            if (!percentage) {
                wrapper.css({
                    width: autosize ? outerWidth(element) + 1 : outerWidth(element),
                    height: outerHeight(element),
                    boxSizing: 'content-box',
                    mozBoxSizing: 'content-box',
                    webkitBoxSizing: 'content-box'
                });
            }
        }
        function deepExtend(destination) {
            var i = 1, length = arguments.length;
            for (i = 1; i < length; i++) {
                deepExtendOne(destination, arguments[i]);
            }
            return destination;
        }
        function deepExtendOne(destination, source) {
            var ObservableArray = quilt.data.ObservableArray, LazyObservableArray = quilt.data.LazyObservableArray, DataSource = quilt.data.DataSource, HierarchicalDataSource = quilt.data.HierarchicalDataSource, property, propValue, propType, propInit, destProp;
            for (property in source) {
                propValue = source[property];
                propType = typeof propValue;
                if (propType === OBJECT && propValue !== null) {
                    propInit = propValue.constructor;
                } else {
                    propInit = null;
                }
                if (propInit && propInit !== Array && propInit !== ObservableArray && propInit !== LazyObservableArray && propInit !== DataSource && propInit !== HierarchicalDataSource && propInit !== RegExp && (!quilt.isFunction(window.ArrayBuffer) || propInit !== ArrayBuffer)) {
                    if (propValue instanceof Date) {
                        destination[property] = new Date(propValue.getTime());
                    } else if (isFunction(propValue.clone)) {
                        destination[property] = propValue.clone();
                    } else {
                        destProp = destination[property];
                        if (typeof destProp === OBJECT) {
                            destination[property] = destProp || {};
                        } else {
                            destination[property] = {};
                        }
                        deepExtendOne(destination[property], propValue);
                    }
                } else if (propType !== UNDEFINED) {
                    destination[property] = propValue;
                }
            }
            return destination;
        }
        function testRx(agent, rxs, dflt) {
            for (var rx in rxs) {
                if (rxs.hasOwnProperty(rx) && rxs[rx].test(agent)) {
                    return rx;
                }
            }
            return dflt !== undefined ? dflt : agent;
        }
        function toHyphens(str) {
            return str.replace(/([a-z][A-Z])/g, function (g) {
                return g.charAt(0) + '-' + g.charAt(1).toLowerCase();
            });
        }
        function toCamelCase(str) {
            return str.replace(/\-(\w)/g, function (strMatch, g1) {
                return g1.toUpperCase();
            });
        }
        function getComputedStyles(element, properties) {
            var styles = {}, computedStyle;
            if (document.defaultView && document.defaultView.getComputedStyle) {
                computedStyle = document.defaultView.getComputedStyle(element, '');
                if (properties) {
                    $.each(properties, function (idx, value) {
                        styles[value] = computedStyle.getPropertyValue(value);
                    });
                }
            } else {
                computedStyle = element.currentStyle;
                if (properties) {
                    $.each(properties, function (idx, value) {
                        styles[value] = computedStyle[toCamelCase(value)];
                    });
                }
            }
            if (!quilt.size(styles)) {
                styles = computedStyle;
            }
            return styles;
        }
        function isScrollable(element) {
            if (element && element.className && typeof element.className === 'string' && element.className.indexOf('k-auto-scrollable') > -1) {
                return true;
            }
            var overflow = getComputedStyles(element, ['overflow']).overflow;
            return overflow.indexOf('auto') > -1 || overflow.indexOf('scroll') > -1;
        }
        function scrollLeft(element, value) {
            var webkit = support.browser.webkit;
            var mozila = support.browser.mozilla;
            var browserVersion = support.browser.version;
            var el, isRtl;
            if (element instanceof $ && value !== undefined) {
                element.each(function (i, e) {
                    scrollLeft(e, value);
                });
                return;
            } else {
                el = element instanceof $ ? element[0] : element;
            }
            if (!el) {
                return;
            }
            isRtl = support.isRtl(element);
            if (value !== undefined) {
                if (isRtl && webkit && (browserVersion < 85 || support.browser.safari)) {
                    el.scrollLeft = el.scrollWidth - el.clientWidth - value;
                } else if (isRtl && (mozila || webkit) && value > 0) {
                    el.scrollLeft = -value;
                } else {
                    el.scrollLeft = value;
                }
            } else {
                if (isRtl && webkit && (browserVersion < 85 || support.browser.safari)) {
                    return el.scrollWidth - el.clientWidth - el.scrollLeft;
                } else {
                    return Math.abs(el.scrollLeft);
                }
            }
        }
        (function () {
            support._scrollbar = undefined;
            support.scrollbar = function (refresh) {
                if (!isNaN(support._scrollbar) && !refresh) {
                    return support._scrollbar;
                } else {
                    var div = document.createElement('div'), result;
                    div.style.cssText = 'overflow:scroll;overflow-x:hidden;zoom:1;clear:both;display:block';
                    div.innerHTML = '&nbsp;';
                    document.body.appendChild(div);
                    support._scrollbar = result = div.offsetWidth - div.scrollWidth;
                    document.body.removeChild(div);
                    return result;
                }
            };
            support.isRtl = function (element) {
                return $(element).closest('.k-rtl').length > 0;
            };
            var table = document.createElement('table');
            try {
                table.innerHTML = '<tr><td></td></tr>';
                support.tbodyInnerHtml = true;
            } catch (e) {
                support.tbodyInnerHtml = false;
            }
            support.touch = 'ontouchstart' in window;
            var docStyle = document.documentElement.style;
            var transitions = support.transitions = false, transforms = support.transforms = false, elementProto = 'HTMLElement' in window ? HTMLElement.prototype : [];
            support.hasHW3D = 'WebKitCSSMatrix' in window && 'm11' in new window.WebKitCSSMatrix() || 'MozPerspective' in docStyle || 'msPerspective' in docStyle;
            support.cssFlexbox = 'flexWrap' in docStyle || 'WebkitFlexWrap' in docStyle || 'msFlexWrap' in docStyle;
            each([
                'Moz',
                'webkit',
                'O',
                'ms'
            ], function () {
                var prefix = this.toString(), hasTransitions = typeof table.style[prefix + 'Transition'] === STRING;
                if (hasTransitions || typeof table.style[prefix + 'Transform'] === STRING) {
                    var lowPrefix = prefix.toLowerCase();
                    transforms = {
                        css: lowPrefix != 'ms' ? '-' + lowPrefix + '-' : '',
                        prefix: prefix,
                        event: lowPrefix === 'o' || lowPrefix === 'webkit' ? lowPrefix : ''
                    };
                    if (hasTransitions) {
                        transitions = transforms;
                        transitions.event = transitions.event ? transitions.event + 'TransitionEnd' : 'transitionend';
                    }
                    return false;
                }
            });
            table = null;
            support.transforms = transforms;
            support.transitions = transitions;
            support.devicePixelRatio = window.devicePixelRatio === undefined ? 1 : window.devicePixelRatio;
            try {
                support.screenWidth = window.outerWidth || window.screen ? window.screen.availWidth : window.innerWidth;
                support.screenHeight = window.outerHeight || window.screen ? window.screen.availHeight : window.innerHeight;
            } catch (e) {
                support.screenWidth = window.screen.availWidth;
                support.screenHeight = window.screen.availHeight;
            }
            support.detectOS = function (ua) {
                var os = false, minorVersion, match = [], notAndroidPhone = !/mobile safari/i.test(ua), agentRxs = {
                        wp: /(Windows Phone(?: OS)?)\s(\d+)\.(\d+(\.\d+)?)/,
                        fire: /(Silk)\/(\d+)\.(\d+(\.\d+)?)/,
                        android: /(Android|Android.*(?:Opera|Firefox).*?\/)\s*(\d+)\.?(\d+(\.\d+)?)?/,
                        iphone: /(iPhone|iPod).*OS\s+(\d+)[\._]([\d\._]+)/,
                        ipad: /(iPad).*OS\s+(\d+)[\._]([\d_]+)/,
                        meego: /(MeeGo).+NokiaBrowser\/(\d+)\.([\d\._]+)/,
                        webos: /(webOS)\/(\d+)\.(\d+(\.\d+)?)/,
                        blackberry: /(BlackBerry|BB10).*?Version\/(\d+)\.(\d+(\.\d+)?)/,
                        playbook: /(PlayBook).*?Tablet\s*OS\s*(\d+)\.(\d+(\.\d+)?)/,
                        windows: /(MSIE)\s+(\d+)\.(\d+(\.\d+)?)/,
                        tizen: /(tizen).*?Version\/(\d+)\.(\d+(\.\d+)?)/i,
                        sailfish: /(sailfish).*rv:(\d+)\.(\d+(\.\d+)?).*firefox/i,
                        ffos: /(Mobile).*rv:(\d+)\.(\d+(\.\d+)?).*Firefox/
                    }, osRxs = {
                        ios: /^i(phone|pad|pod)$/i,
                        android: /^android|fire$/i,
                        blackberry: /^blackberry|playbook/i,
                        windows: /windows/,
                        wp: /wp/,
                        flat: /sailfish|ffos|tizen/i,
                        meego: /meego/
                    }, formFactorRxs = { tablet: /playbook|ipad|fire/i }, browserRxs = {
                        omini: /Opera\sMini/i,
                        omobile: /Opera\sMobi/i,
                        firefox: /Firefox|Fennec/i,
                        mobilesafari: /version\/.*safari/i,
                        ie: /MSIE|Windows\sPhone/i,
                        chrome: /chrome|crios/i,
                        webkit: /webkit/i
                    };
                for (var agent in agentRxs) {
                    if (agentRxs.hasOwnProperty(agent)) {
                        match = ua.match(agentRxs[agent]);
                        if (match) {
                            if (agent == 'windows' && 'plugins' in navigator) {
                                return false;
                            }
                            os = {};
                            os.device = agent;
                            os.tablet = testRx(agent, formFactorRxs, false);
                            os.browser = testRx(ua, browserRxs, 'default');
                            os.name = testRx(agent, osRxs);
                            os[os.name] = true;
                            os.majorVersion = match[2];
                            os.minorVersion = (match[3] || '0').replace('_', '.');
                            minorVersion = os.minorVersion.replace('.', '').substr(0, 2);
                            os.flatVersion = os.majorVersion + minorVersion + new Array(3 - (minorVersion.length < 3 ? minorVersion.length : 2)).join('0');
                            os.cordova = typeof window.PhoneGap !== UNDEFINED || typeof window.cordova !== UNDEFINED;
                            os.appMode = window.navigator.standalone || /file|local|wmapp/.test(window.location.protocol) || os.cordova;
                            if (os.android && (support.devicePixelRatio < 1.5 && os.flatVersion < 400 || notAndroidPhone) && (support.screenWidth > 800 || support.screenHeight > 800)) {
                                os.tablet = agent;
                            }
                            break;
                        }
                    }
                }
                return os;
            };
            var mobileOS = support.mobileOS = support.detectOS(navigator.userAgent);
            support.wpDevicePixelRatio = mobileOS.wp ? screen.width / 320 : 0;
            support.hasNativeScrolling = false;
            if (mobileOS.ios || mobileOS.android && mobileOS.majorVersion > 2 || mobileOS.wp) {
                support.hasNativeScrolling = mobileOS;
            }
            support.delayedClick = function () {
                if (support.touch) {
                    if (mobileOS.ios) {
                        return true;
                    }
                    if (mobileOS.android) {
                        if (!support.browser.chrome) {
                            return true;
                        }
                        if (support.browser.version < 32) {
                            return false;
                        }
                        return !($('meta[name=viewport]').attr('content') || '').match(/user-scalable=no/i);
                    }
                }
                return false;
            };
            support.mouseAndTouchPresent = support.touch && !(support.mobileOS.ios || support.mobileOS.android);
            support.detectBrowser = function (ua) {
                var browser = false, match = [], browserRxs = {
                        edge: /(edge)[ \/]([\w.]+)/i,
                        webkit: /(chrome|crios)[ \/]([\w.]+)/i,
                        safari: /(webkit)[ \/]([\w.]+)/i,
                        opera: /(opera)(?:.*version|)[ \/]([\w.]+)/i,
                        msie: /(msie\s|trident.*? rv:)([\w.]+)/i,
                        mozilla: /(mozilla)(?:.*? rv:([\w.]+)|)/i
                    };
                for (var agent in browserRxs) {
                    if (browserRxs.hasOwnProperty(agent)) {
                        match = ua.match(browserRxs[agent]);
                        if (match) {
                            browser = {};
                            browser[agent] = true;
                            browser[match[1].toLowerCase().split(' ')[0].split('/')[0]] = true;
                            browser.version = parseInt(document.documentMode || match[2], 10);
                            break;
                        }
                    }
                }
                return browser;
            };
            support.browser = support.detectBrowser(navigator.userAgent);
            support.detectClipboardAccess = function () {
                var commands = {
                    copy: document.queryCommandSupported ? document.queryCommandSupported('copy') : false,
                    cut: document.queryCommandSupported ? document.queryCommandSupported('cut') : false,
                    paste: document.queryCommandSupported ? document.queryCommandSupported('paste') : false
                };
                if (support.browser.chrome) {
                    commands.paste = false;
                    if (support.browser.version >= 43) {
                        commands.copy = true;
                        commands.cut = true;
                    }
                }
                return commands;
            };
            support.clipboard = support.detectClipboardAccess();
            support.zoomLevel = function () {
                try {
                    var browser = support.browser;
                    var ie11WidthCorrection = 0;
                    var docEl = document.documentElement;
                    if (browser.msie && browser.version == 11 && docEl.scrollHeight > docEl.clientHeight && !support.touch) {
                        ie11WidthCorrection = support.scrollbar();
                    }
                    return support.touch ? docEl.clientWidth / window.innerWidth : browser.msie && browser.version >= 10 ? ((top || window).document.documentElement.offsetWidth + ie11WidthCorrection) / (top || window).innerWidth : 1;
                } catch (e) {
                    return 1;
                }
            };
            (function (browser) {
                var cssClass = '', docElement = $(document.documentElement), majorVersion = parseInt(browser.version, 10);
                if (browser.msie) {
                    cssClass = 'ie';
                } else if (browser.mozilla) {
                    cssClass = 'ff';
                } else if (browser.safari) {
                    cssClass = 'safari';
                } else if (browser.webkit) {
                    cssClass = 'webkit';
                } else if (browser.opera) {
                    cssClass = 'opera';
                } else if (browser.edge) {
                    cssClass = 'edge';
                }
                if (cssClass) {
                    cssClass = 'k-' + cssClass + ' k-' + cssClass + majorVersion;
                }
                if (support.mobileOS) {
                    cssClass += ' k-mobile';
                }
                if (!support.cssFlexbox) {
                    cssClass += ' k-no-flexbox';
                }
                docElement.addClass(cssClass);
            }(support.browser));
            support.eventCapture = document.documentElement.addEventListener;
            var input = document.createElement('input');
            support.placeholder = 'placeholder' in input;
            support.propertyChangeEvent = 'onpropertychange' in input;
            support.input = function () {
                var types = [
                    'number',
                    'date',
                    'time',
                    'month',
                    'week',
                    'datetime',
                    'datetime-local'
                ];
                var length = types.length;
                var value = 'test';
                var result = {};
                var idx = 0;
                var type;
                for (; idx < length; idx++) {
                    type = types[idx];
                    input.setAttribute('type', type);
                    input.value = value;
                    result[type.replace('-', '')] = input.type !== 'text' && input.value !== value;
                }
                return result;
            }();
            input.style.cssText = 'float:left;';
            support.cssFloat = !!input.style.cssFloat;
            input = null;
            support.stableSort = function () {
                var threshold = 513;
                var sorted = [{
                        index: 0,
                        field: 'b'
                    }];
                for (var i = 1; i < threshold; i++) {
                    sorted.push({
                        index: i,
                        field: 'a'
                    });
                }
                sorted.sort(function (a, b) {
                    return a.field > b.field ? 1 : a.field < b.field ? -1 : 0;
                });
                return sorted[0].index === 1;
            }();
            support.matchesSelector = elementProto.webkitMatchesSelector || elementProto.mozMatchesSelector || elementProto.msMatchesSelector || elementProto.oMatchesSelector || elementProto.matchesSelector || elementProto.matches || function (selector) {
                var nodeList = document.querySelectorAll ? (this.parentNode || document).querySelectorAll(selector) || [] : $(selector), i = nodeList.length;
                while (i--) {
                    if (nodeList[i] == this) {
                        return true;
                    }
                }
                return false;
            };
            support.matchMedia = 'matchMedia' in window;
            support.pushState = window.history && window.history.pushState;
            support.hashChange = 'onhashchange' in window;
            support.customElements = 'registerElement' in window.document;
            var chrome = support.browser.chrome, mobileChrome = support.browser.crios, mozilla = support.browser.mozilla, safari = support.browser.safari;
            support.msPointers = !chrome && window.MSPointerEvent;
            support.pointers = !chrome && !mobileChrome && !mozilla && !safari && window.PointerEvent;
            support.kineticScrollNeeded = mobileOS && (support.touch || support.msPointers || support.pointers);
        }());
        function size(obj) {
            var result = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key) && key != 'toJSON') {
                    result++;
                }
            }
            return result;
        }
        function getOffset(element, type, positioned) {
            if (!type) {
                type = 'offset';
            }
            var offset = element[type]();
            var result = {
                top: offset.top,
                right: offset.right,
                bottom: offset.bottom,
                left: offset.left
            };
            if (support.browser.msie && (support.pointers || support.msPointers) && !positioned) {
                var sign = support.isRtl(element) ? 1 : -1;
                result.top -= window.pageYOffset - document.documentElement.scrollTop;
                result.left -= window.pageXOffset + sign * document.documentElement.scrollLeft;
            }
            return result;
        }
        var directions = {
            left: { reverse: 'right' },
            right: { reverse: 'left' },
            down: { reverse: 'up' },
            up: { reverse: 'down' },
            top: { reverse: 'bottom' },
            bottom: { reverse: 'top' },
            'in': { reverse: 'out' },
            out: { reverse: 'in' }
        };
        function parseEffects(input) {
            var effects = {};
            each(typeof input === 'string' ? input.split(' ') : input, function (idx) {
                effects[idx] = this;
            });
            return effects;
        }
        function fx(element) {
            return new quilt.effects.Element(element);
        }
        var effects = {};
        $.extend(effects, {
            enabled: true,
            Element: function (element) {
                this.element = $(element);
            },
            promise: function (element, options) {
                if (!element.is(':visible')) {
                    element.css({ display: element.data('olddisplay') || 'block' }).css('display');
                }
                if (options.hide) {
                    element.data('olddisplay', element.css('display')).hide();
                }
                if (options.init) {
                    options.init();
                }
                if (options.completeCallback) {
                    options.completeCallback(element);
                }
                element.dequeue();
            },
            disable: function () {
                this.enabled = false;
                this.promise = this.promiseShim;
            },
            enable: function () {
                this.enabled = true;
                this.promise = this.animatedPromise;
            }
        });
        effects.promiseShim = effects.promise;
        function prepareAnimationOptions(options, duration, reverse, complete) {
            if (typeof options === STRING) {
                if (isFunction(duration)) {
                    complete = duration;
                    duration = 400;
                    reverse = false;
                }
                if (isFunction(reverse)) {
                    complete = reverse;
                    reverse = false;
                }
                if (typeof duration === BOOLEAN) {
                    reverse = duration;
                    duration = 400;
                }
                options = {
                    effects: options,
                    duration: duration,
                    reverse: reverse,
                    complete: complete
                };
            }
            return extend({
                effects: {},
                duration: 400,
                reverse: false,
                init: noop,
                teardown: noop,
                hide: false
            }, options, {
                completeCallback: options.complete,
                complete: noop
            });
        }
        function animate(element, options, duration, reverse, complete) {
            var idx = 0, length = element.length, instance;
            for (; idx < length; idx++) {
                instance = $(element[idx]);
                instance.queue(function () {
                    effects.promise(instance, prepareAnimationOptions(options, duration, reverse, complete));
                });
            }
            return element;
        }
        function toggleClass(element, classes, options, add) {
            if (classes) {
                classes = classes.split(' ');
                each(classes, function (idx, value) {
                    element.toggleClass(value, add);
                });
            }
            return element;
        }
        if (!('quiltAnimate' in $.fn)) {
            extend($.fn, {
                quiltStop: function (clearQueue, gotoEnd) {
                    return this.stop(clearQueue, gotoEnd);
                },
                quiltAnimate: function (options, duration, reverse, complete) {
                    return animate(this, options, duration, reverse, complete);
                },
                quiltAddClass: function (classes, options) {
                    return quilt.toggleClass(this, classes, options, true);
                },
                quiltRemoveClass: function (classes, options) {
                    return quilt.toggleClass(this, classes, options, false);
                },
                quiltToggleClass: function (classes, options, toggle) {
                    return quilt.toggleClass(this, classes, options, toggle);
                }
            });
        }
        var ampRegExp = /&/g, ltRegExp = /</g, quoteRegExp = /"/g, aposRegExp = /'/g, gtRegExp = />/g;
        function htmlEncode(value) {
            return ('' + value).replace(ampRegExp, '&amp;').replace(ltRegExp, '&lt;').replace(gtRegExp, '&gt;').replace(quoteRegExp, '&quot;').replace(aposRegExp, '&#39;');
        }
        function unescape(value) {
            var template;
            try {
                template = window.decodeURIComponent(value);
            } catch (error) {
                template = value.replace(/%u([\dA-F]{4})|%([\dA-F]{2})/gi, function (_, m1, m2) {
                    return String.fromCharCode(parseInt('0x' + (m1 || m2), 16));
                });
            }
            return template;
        }
        var eventTarget = function (e) {
            return e.target;
        };
        if (support.touch) {
            eventTarget = function (e) {
                var touches = 'originalEvent' in e ? e.originalEvent.changedTouches : 'changedTouches' in e ? e.changedTouches : null;
                return touches ? document.elementFromPoint(touches[0].clientX, touches[0].clientY) : e.target;
            };
            each([
                'swipe',
                'swipeLeft',
                'swipeRight',
                'swipeUp',
                'swipeDown',
                'doubleTap',
                'tap'
            ], function (m, value) {
                $.fn[value] = function (callback) {
                    return this.bind(value, callback);
                };
            });
        }
        if (support.touch) {
            if (!support.mobileOS) {
                support.mousedown = 'mousedown touchstart';
                support.mouseup = 'mouseup touchend';
                support.mousemove = 'mousemove touchmove';
                support.mousecancel = 'mouseleave touchcancel';
                support.click = 'click';
                support.resize = 'resize';
            } else {
                support.mousedown = 'touchstart';
                support.mouseup = 'touchend';
                support.mousemove = 'touchmove';
                support.mousecancel = 'touchcancel';
                support.click = 'touchend';
                support.resize = 'orientationchange';
            }
        } else if (support.pointers) {
            support.mousemove = 'pointermove';
            support.mousedown = 'pointerdown';
            support.mouseup = 'pointerup';
            support.mousecancel = 'pointercancel';
            support.click = 'pointerup';
            support.resize = 'orientationchange resize';
        } else if (support.msPointers) {
            support.mousemove = 'MSPointerMove';
            support.mousedown = 'MSPointerDown';
            support.mouseup = 'MSPointerUp';
            support.mousecancel = 'MSPointerCancel';
            support.click = 'MSPointerUp';
            support.resize = 'orientationchange resize';
        } else {
            support.mousemove = 'mousemove';
            support.mousedown = 'mousedown';
            support.mouseup = 'mouseup';
            support.mousecancel = 'mouseleave';
            support.click = 'click';
            support.resize = 'resize';
        }
        var wrapExpression = function (members, paramName) {
                var result = paramName || 'd', index, idx, length, member, count = 1;
                for (idx = 0, length = members.length; idx < length; idx++) {
                    member = members[idx];
                    if (member !== '') {
                        index = member.indexOf('[');
                        if (index !== 0) {
                            if (index == -1) {
                                member = '.' + member;
                            } else {
                                count++;
                                member = '.' + member.substring(0, index) + ' || {})' + member.substring(index);
                            }
                        }
                        count++;
                        result += member + (idx < length - 1 ? ' || {})' : ')');
                    }
                }
                return new Array(count).join('(') + result;
            }, localUrlRe = /^([a-z]+:)?\/\//i;
        extend(quilt, {
            widgets: [],
            _widgetRegisteredCallbacks: [],
            ui: quilt.ui || {},
            fx: quilt.fx || fx,
            effects: quilt.effects || effects,
            mobile: quilt.mobile || {},
            data: quilt.data || {},
            dataviz: quilt.dataviz || {},
            drawing: quilt.drawing || {},
            spreadsheet: { messages: {} },
            keys: {
                INSERT: 45,
                DELETE: 46,
                BACKSPACE: 8,
                TAB: 9,
                ENTER: 13,
                ESC: 27,
                LEFT: 37,
                UP: 38,
                RIGHT: 39,
                DOWN: 40,
                END: 35,
                HOME: 36,
                SPACEBAR: 32,
                PAGEUP: 33,
                PAGEDOWN: 34,
                F2: 113,
                F10: 121,
                F12: 123,
                NUMPAD_PLUS: 107,
                NUMPAD_MINUS: 109,
                NUMPAD_DOT: 110
            },
            support: quilt.support || support,
            animate: quilt.animate || animate,
            ns: '',
            attr: function (value) {
                return 'data-' + quilt.ns + value;
            },
            getShadows: getShadows,
            wrap: wrap,
            deepExtend: deepExtend,
            getComputedStyles: getComputedStyles,
            isScrollable: isScrollable,
            scrollLeft: scrollLeft,
            size: size,
            toCamelCase: toCamelCase,
            toHyphens: toHyphens,
            getOffset: quilt.getOffset || getOffset,
            parseEffects: quilt.parseEffects || parseEffects,
            toggleClass: quilt.toggleClass || toggleClass,
            directions: quilt.directions || directions,
            Observable: Observable,
            Class: Class,
            Template: Template,
            template: proxy(Template.compile, Template),
            render: proxy(Template.render, Template),
            stringify: proxy(JSON.stringify, JSON),
            eventTarget: eventTarget,
            htmlEncode: htmlEncode,
            unescape: unescape,
            isLocalUrl: function (url) {
                return url && !localUrlRe.test(url);
            },
            expr: function (expression, safe, paramName) {
                expression = expression || '';
                if (typeof safe == STRING) {
                    paramName = safe;
                    safe = false;
                }
                paramName = paramName || 'd';
                if (expression && expression.charAt(0) !== '[') {
                    expression = '.' + expression;
                }
                if (safe) {
                    expression = expression.replace(/"([^.]*)\.([^"]*)"/g, '"$1_$DOT$_$2"');
                    expression = expression.replace(/'([^.]*)\.([^']*)'/g, '\'$1_$DOT$_$2\'');
                    expression = wrapExpression(expression.split('.'), paramName);
                    expression = expression.replace(/_\$DOT\$_/g, '.');
                } else {
                    expression = paramName + expression;
                }
                return expression;
            },
            getter: function (expression, safe) {
                var key = expression + safe;
                return getterCache[key] = getterCache[key] || new Function('d', 'return ' + quilt.expr(expression, safe));
            },
            setter: function (expression) {
                return setterCache[expression] = setterCache[expression] || new Function('d,value', quilt.expr(expression) + '=value');
            },
            accessor: function (expression) {
                return {
                    get: quilt.getter(expression),
                    set: quilt.setter(expression)
                };
            },
            guid: function () {
                var id = '', i, random, chars = 'abcdef';
                id += chars[Math.floor(Math.random() * Math.floor(chars.length))];
                for (i = 1; i < 32; i++) {
                    random = math.random() * 16 | 0;
                    if (i == 8 || i == 12 || i == 16 || i == 20) {
                        id += '-';
                    }
                    id += (i == 12 ? 4 : i == 16 ? random & 3 | 8 : random).toString(16);
                }
                return id;
            },
            roleSelector: function (role) {
                return role.replace(/(\S+)/g, '[' + quilt.attr('role') + '=$1],').slice(0, -1);
            },
            directiveSelector: function (directives) {
                var selectors = directives.split(' ');
                if (selectors) {
                    for (var i = 0; i < selectors.length; i++) {
                        if (selectors[i] != 'view') {
                            selectors[i] = selectors[i].replace(/(\w*)(view|bar|strip|over)$/, '$1-$2');
                        }
                    }
                }
                return selectors.join(' ').replace(/(\S+)/g, 'quilt-mobile-$1,').slice(0, -1);
            },
            triggeredByInput: function (e) {
                return /^(label|input|textarea|select)$/i.test(e.target.tagName);
            },
            onWidgetRegistered: function (callback) {
                for (var i = 0, len = quilt.widgets.length; i < len; i++) {
                    callback(quilt.widgets[i]);
                }
                quilt._widgetRegisteredCallbacks.push(callback);
            },
            logToConsole: function (message, type) {
                var console = window.console;
                if (!quilt.suppressLog && typeof console != 'undefined' && console.log) {
                    console[type || 'log'](message);
                }
            }
        });
        var Widget = Observable.extend({
            init: function (element, options) {
                var that = this;
                that.element = quilt.jQuery(element).handler(that);
                that.angular('init', options);
                Observable.fn.init.call(that);
                var dataSource = options ? options.dataSource : null;
                var props;
                if (options) {
                    props = (that.componentTypes || {})[(options || {}).componentType];
                }
                if (dataSource) {
                    options = extend({}, options, { dataSource: {} });
                }
                options = that.options = extend(true, {}, that.options, that.defaults, props || {}, options);
                if (dataSource) {
                    options.dataSource = dataSource;
                }
                if (!that.element.attr(quilt.attr('role'))) {
                    that.element.attr(quilt.attr('role'), (options.name || '').toLowerCase());
                }
                that.element.data('quilt' + options.prefix + options.name, that);
                that.bind(that.events, options);
            },
            events: [],
            options: { prefix: '' },
            _hasBindingTarget: function () {
                return !!this.element[0].quiltBindingTarget;
            },
            _tabindex: function (target) {
                target = target || this.wrapper;
                var element = this.element, TABINDEX = 'tabindex', tabindex = target.attr(TABINDEX) || element.attr(TABINDEX);
                element.removeAttr(TABINDEX);
                target.attr(TABINDEX, !isNaN(tabindex) ? tabindex : 0);
            },
            setOptions: function (options) {
                this._setEvents(options);
                $.extend(this.options, options);
            },
            _setEvents: function (options) {
                var that = this, idx = 0, length = that.events.length, e;
                for (; idx < length; idx++) {
                    e = that.events[idx];
                    if (that.options[e] && options[e]) {
                        that.unbind(e, that.options[e]);
                        if (that._events && that._events[e]) {
                            delete that._events[e];
                        }
                    }
                }
                that.bind(that.events, options);
            },
            resize: function (force) {
                var size = this.getSize(), currentSize = this._size;
                if (force || (size.width > 0 || size.height > 0) && (!currentSize || size.width !== currentSize.width || size.height !== currentSize.height)) {
                    this._size = size;
                    this._resize(size, force);
                    this.trigger('resize', size);
                }
            },
            getSize: function () {
                return quilt.dimensions(this.element);
            },
            size: function (size) {
                if (!size) {
                    return this.getSize();
                } else {
                    this.setSize(size);
                }
            },
            setSize: $.noop,
            _resize: $.noop,
            destroy: function () {
                var that = this;
                that.element.removeData('quilt' + that.options.prefix + that.options.name);
                that.element.removeData('handler');
                that.unbind();
            },
            _destroy: function () {
                this.destroy();
            },
            angular: function () {
            },
            _muteAngularRebind: function (callback) {
                this._muteRebind = true;
                callback.call(this);
                this._muteRebind = false;
            }
        });
        var DataBoundWidget = Widget.extend({
            dataItems: function () {
                return this.dataSource.flatView();
            },
            _angularItems: function (cmd) {
                var that = this;
                that.angular(cmd, function () {
                    return {
                        elements: that.items(),
                        data: $.map(that.dataItems(), function (dataItem) {
                            return { dataItem: dataItem };
                        })
                    };
                });
            }
        });
        quilt.dimensions = function (element, dimensions) {
            var domElement = element[0];
            if (dimensions) {
                element.css(dimensions);
            }
            return {
                width: domElement.offsetWidth,
                height: domElement.offsetHeight
            };
        };
        quilt.notify = noop;
        var templateRegExp = /template$/i, jsonRegExp = /^\s*(?:\{(?:.|\r\n|\n)*\}|\[(?:.|\r\n|\n)*\])\s*$/, jsonFormatRegExp = /^\{(\d+)(:[^\}]+)?\}|^\[[A-Za-z_]+\]$/, dashRegExp = /([A-Z])/g;
        function parseOption(element, option) {
            var value;
            if (option.indexOf('data') === 0) {
                option = option.substring(4);
                option = option.charAt(0).toLowerCase() + option.substring(1);
            }
            option = option.replace(dashRegExp, '-$1');
            value = element.getAttribute('data-' + quilt.ns + option);
            if (value === null) {
                value = undefined;
            } else if (value === 'null') {
                value = null;
            } else if (value === 'true') {
                value = true;
            } else if (value === 'false') {
                value = false;
            } else if (numberRegExp.test(value) && option != 'mask') {
                value = parseFloat(value);
            } else if (jsonRegExp.test(value) && !jsonFormatRegExp.test(value)) {
                value = new Function('return (' + value + ')')();
            }
            return value;
        }
        function parseOptions(element, options, source) {
            var result = {}, option, value, role = element.getAttribute('data-' + quilt.ns + 'role');
            for (option in options) {
                value = parseOption(element, option);
                if (value !== undefined) {
                    if (templateRegExp.test(option) && role != 'drawer') {
                        if (typeof value === 'string') {
                            if ($('#' + value).length) {
                                value = quilt.template($('#' + value).html());
                            } else if (source) {
                                value = quilt.template(source[value]);
                            }
                        } else {
                            value = element.getAttribute(option);
                        }
                    }
                    result[option] = value;
                }
            }
            return result;
        }
        quilt.initWidget = function (element, options, roles) {
            var result, option, widget, idx, length, role, value, dataSource, fullPath, widgetKeyRegExp;
            if (!roles) {
                roles = quilt.ui.roles;
            } else if (roles.roles) {
                roles = roles.roles;
            }
            element = element.nodeType ? element : element[0];
            role = element.getAttribute('data-' + quilt.ns + 'role');
            if (!role) {
                return;
            }
            fullPath = role.indexOf('.') === -1;
            if (fullPath) {
                widget = roles[role];
            } else {
                widget = quilt.getter(role)(window);
            }
            var data = $(element).data(), widgetKey = widget ? 'quilt' + widget.fn.options.prefix + widget.fn.options.name : '';
            if (fullPath) {
                widgetKeyRegExp = new RegExp('^quilt.*' + role + '$', 'i');
            } else {
                widgetKeyRegExp = new RegExp('^' + widgetKey + '$', 'i');
            }
            for (var key in data) {
                if (key.match(widgetKeyRegExp)) {
                    if (key === widgetKey) {
                        result = data[key];
                    } else {
                        return data[key];
                    }
                }
            }
            if (!widget) {
                return;
            }
            dataSource = parseOption(element, 'dataSource');
            options = $.extend({}, parseOptions(element, $.extend({}, widget.fn.options, widget.fn.defaults)), options);
            if (dataSource) {
                if (typeof dataSource === STRING) {
                    options.dataSource = quilt.getter(dataSource)(window);
                } else {
                    options.dataSource = dataSource;
                }
            }
            for (idx = 0, length = widget.fn.events.length; idx < length; idx++) {
                option = widget.fn.events[idx];
                value = parseOption(element, option);
                if (value !== undefined) {
                    options[option] = quilt.getter(value)(window);
                }
            }
            if (!result) {
                result = new widget(element, options);
            } else if (!$.isEmptyObject(options)) {
                result.setOptions(options);
            }
            return result;
        };
        quilt.rolesFromNamespaces = function (namespaces) {
            var roles = [], idx, length;
            if (!namespaces[0]) {
                namespaces = [
                    quilt.ui,
                    quilt.dataviz.ui
                ];
            }
            for (idx = 0, length = namespaces.length; idx < length; idx++) {
                roles[idx] = namespaces[idx].roles;
            }
            return extend.apply(null, [{}].concat(roles.reverse()));
        };
        quilt.init = function (element) {
            var roles = quilt.rolesFromNamespaces(slice.call(arguments, 1));
            $(element).find('[data-' + quilt.ns + 'role]').addBack().each(function () {
                quilt.initWidget(this, {}, roles);
            });
        };
        quilt.destroy = function (element) {
            $(element).find('[data-' + quilt.ns + 'role]').addBack().each(function () {
                var data = $(this).data();
                for (var key in data) {
                    if (key.indexOf('quilt') === 0 && typeof data[key].destroy === FUNCTION) {
                        data[key].destroy();
                    }
                }
            });
        };
        function containmentComparer(a, b) {
            return $.contains(a, b) ? -1 : 1;
        }
        function resizableWidget() {
            var widget = $(this);
            return $.inArray(widget.attr('data-' + quilt.ns + 'role'), [
                'slider',
                'rangeslider',
                'breadcrumb'
            ]) > -1 || widget.is(':visible');
        }
        quilt.resize = function (element, force) {
            var widgets = $(element).find('[data-' + quilt.ns + 'role]').addBack().filter(resizableWidget);
            if (!widgets.length) {
                return;
            }
            var widgetsArray = $.makeArray(widgets);
            widgetsArray.sort(containmentComparer);
            $.each(widgetsArray, function () {
                var widget = quilt.widgetInstance($(this));
                if (widget) {
                    widget.resize(force);
                }
            });
        };
        quilt.parseOptions = parseOptions;
        extend(quilt.ui, {
            Widget: Widget,
            DataBoundWidget: DataBoundWidget,
            roles: {},
            progress: function (container, toggle, options) {
                var mask = container.find('.k-loading-mask'), support = quilt.support, browser = support.browser, isRtl, leftRight, webkitCorrection, containerScrollLeft, cssClass;
                options = $.extend({}, {
                    width: '100%',
                    height: '100%',
                    top: container.scrollTop(),
                    opacity: false
                }, options);
                cssClass = options.opacity ? 'k-loading-mask k-opaque' : 'k-loading-mask';
                if (toggle) {
                    if (!mask.length) {
                        isRtl = support.isRtl(container);
                        leftRight = isRtl ? 'right' : 'left';
                        containerScrollLeft = quilt.scrollLeft(container);
                        webkitCorrection = browser.webkit ? !isRtl ? 0 : container[0].scrollWidth - container.width() - 2 * containerScrollLeft : 0;
                        mask = $(quilt.format('<div class=\'{0}\'><span class=\'k-loading-text\'>{1}</span><div class=\'k-loading-image\'></div><div class=\'k-loading-color\'></div></div>', cssClass, quilt.ui.progress.messages.loading)).width(options.width).height(options.height).css('top', options.top).css(leftRight, Math.abs(containerScrollLeft) + webkitCorrection).prependTo(container);
                    }
                } else if (mask) {
                    mask.remove();
                }
            },
            plugin: function (widget, register, prefix) {
                var name = widget.fn.options.name, getter;
                register = register || quilt.ui;
                prefix = prefix || '';
                register[name] = widget;
                register.roles[name.toLowerCase()] = widget;
                getter = 'getQuilt' + prefix + name;
                name = 'quilt' + prefix + name;
                var widgetEntry = {
                    name: name,
                    widget: widget,
                    prefix: prefix || ''
                };
                quilt.widgets.push(widgetEntry);
                for (var i = 0, len = quilt._widgetRegisteredCallbacks.length; i < len; i++) {
                    quilt._widgetRegisteredCallbacks[i](widgetEntry);
                }
                $.fn[name] = function (options) {
                    var value = this, args;
                    if (typeof options === STRING) {
                        args = slice.call(arguments, 1);
                        this.each(function () {
                            var widget = $.data(this, name), method, result;
                            if (!widget) {
                                throw new Error(quilt.format('Cannot call method \'{0}\' of {1} before it is initialized', options, name));
                            }
                            method = widget[options];
                            if (typeof method !== FUNCTION) {
                                throw new Error(quilt.format('Cannot find method \'{0}\' of {1}', options, name));
                            }
                            result = method.apply(widget, args);
                            if (result !== undefined) {
                                value = result;
                                return false;
                            }
                        });
                    } else {
                        this.each(function () {
                            return new widget(this, options);
                        });
                    }
                    return value;
                };
                $.fn[name].widget = widget;
                $.fn[getter] = function () {
                    return this.data(name);
                };
            }
        });
        quilt.ui.progress.messages = { loading: 'Loading...' };
        var ContainerNullObject = {
            bind: function () {
                return this;
            },
            nullObject: true,
            options: {}
        };
        var MobileWidget = Widget.extend({
            init: function (element, options) {
                Widget.fn.init.call(this, element, options);
                this.element.autoApplyNS();
                this.wrapper = this.element;
                this.element.addClass('km-widget');
            },
            destroy: function () {
                Widget.fn.destroy.call(this);
                this.element.quiltDestroy();
            },
            options: { prefix: 'Mobile' },
            events: [],
            view: function () {
                var viewElement = this.element.closest(quilt.roleSelector('view splitview modalview drawer'));
                return quilt.widgetInstance(viewElement, quilt.mobile.ui) || ContainerNullObject;
            },
            viewHasNativeScrolling: function () {
                var view = this.view();
                return view && view.options.useNativeScrolling;
            },
            container: function () {
                var element = this.element.closest(quilt.roleSelector('view layout modalview drawer splitview'));
                return quilt.widgetInstance(element.eq(0), quilt.mobile.ui) || ContainerNullObject;
            }
        });
        extend(quilt.mobile, {
            init: function (element) {
                quilt.init(element, quilt.mobile.ui, quilt.ui, quilt.dataviz.ui);
            },
            appLevelNativeScrolling: function () {
                return quilt.mobile.application && quilt.mobile.application.options && quilt.mobile.application.options.useNativeScrolling;
            },
            roles: {},
            ui: {
                Widget: MobileWidget,
                DataBoundWidget: DataBoundWidget.extend(MobileWidget.prototype),
                roles: {},
                plugin: function (widget) {
                    quilt.ui.plugin(widget, quilt.mobile.ui, 'Mobile');
                }
            }
        });
        deepExtend(quilt.dataviz, {
            init: function (element) {
                quilt.init(element, quilt.dataviz.ui);
            },
            ui: {
                roles: {},
                themes: {},
                views: [],
                plugin: function (widget) {
                    quilt.ui.plugin(widget, quilt.dataviz.ui);
                }
            },
            roles: {}
        });
        quilt.touchScroller = function (elements, options) {
            if (!options) {
                options = {};
            }
            options.useNative = true;
            return $(elements).map(function (idx, element) {
                element = $(element);
                if (support.kineticScrollNeeded && quilt.mobile.ui.Scroller && !element.data('quiltMobileScroller')) {
                    element.quiltMobileScroller(options);
                    return element.data('quiltMobileScroller');
                } else {
                    return false;
                }
            })[0];
        };
        quilt.preventDefault = function (e) {
            e.preventDefault();
        };
        quilt.widgetInstance = function (element, suites) {
            var role = element.data(quilt.ns + 'role'), widgets = [], i, length, elementData = element.data('quiltView');
            if (role) {
                if (role === 'content') {
                    role = 'scroller';
                }
                if (role === 'editortoolbar') {
                    var editorToolbar = element.data('quiltEditorToolbar');
                    if (editorToolbar) {
                        return editorToolbar;
                    }
                }
                if (role === 'view' && elementData) {
                    return elementData;
                }
                if (suites) {
                    if (suites[0]) {
                        for (i = 0, length = suites.length; i < length; i++) {
                            widgets.push(suites[i].roles[role]);
                        }
                    } else {
                        widgets.push(suites.roles[role]);
                    }
                } else {
                    widgets = [
                        quilt.ui.roles[role],
                        quilt.dataviz.ui.roles[role],
                        quilt.mobile.ui.roles[role]
                    ];
                }
                if (role.indexOf('.') >= 0) {
                    widgets = [quilt.getter(role)(window)];
                }
                for (i = 0, length = widgets.length; i < length; i++) {
                    var widget = widgets[i];
                    if (widget) {
                        var instance = element.data('quilt' + widget.fn.options.prefix + widget.fn.options.name);
                        if (instance) {
                            return instance;
                        }
                    }
                }
            }
        };
        quilt.onResize = function (callback) {
            var handler = callback;
            if (support.mobileOS.android) {
                handler = function () {
                    setTimeout(callback, 600);
                };
            }
            $(window).on(support.resize, handler);
            return handler;
        };
        quilt.unbindResize = function (callback) {
            $(window).off(support.resize, callback);
        };
        quilt.attrValue = function (element, key) {
            return element.data(quilt.ns + key);
        };
        quilt.days = {
            Sunday: 0,
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6
        };
        function focusable(element, isTabIndexNotNaN) {
            var nodeName = element.nodeName.toLowerCase();
            return (/input|select|textarea|button|object/.test(nodeName) ? !element.disabled : 'a' === nodeName ? element.href || isTabIndexNotNaN : isTabIndexNotNaN) && visible(element);
        }
        function visible(element) {
            return $.expr.pseudos.visible(element) && !$(element).parents().addBack().filter(function () {
                return $.css(this, 'visibility') === 'hidden';
            }).length;
        }
        $.extend($.expr.pseudos, {
            quiltFocusable: function (element) {
                var idx = $.attr(element, 'tabindex');
                return focusable(element, !isNaN(idx) && idx > -1);
            }
        });
        var MOUSE_EVENTS = [
            'mousedown',
            'mousemove',
            'mouseenter',
            'mouseleave',
            'mouseover',
            'mouseout',
            'mouseup',
            'click'
        ];
        var EXCLUDE_BUST_CLICK_SELECTOR = 'label, input, [data-rel=external]';
        var MouseEventNormalizer = {
            setupMouseMute: function () {
                var idx = 0, length = MOUSE_EVENTS.length, element = document.documentElement;
                if (MouseEventNormalizer.mouseTrap || !support.eventCapture) {
                    return;
                }
                MouseEventNormalizer.mouseTrap = true;
                MouseEventNormalizer.bustClick = false;
                MouseEventNormalizer.captureMouse = false;
                var handler = function (e) {
                    if (MouseEventNormalizer.captureMouse) {
                        if (e.type === 'click') {
                            if (MouseEventNormalizer.bustClick && !$(e.target).is(EXCLUDE_BUST_CLICK_SELECTOR)) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        } else {
                            e.stopPropagation();
                        }
                    }
                };
                for (; idx < length; idx++) {
                    element.addEventListener(MOUSE_EVENTS[idx], handler, true);
                }
            },
            muteMouse: function (e) {
                MouseEventNormalizer.captureMouse = true;
                if (e.data.bustClick) {
                    MouseEventNormalizer.bustClick = true;
                }
                clearTimeout(MouseEventNormalizer.mouseTrapTimeoutID);
            },
            unMuteMouse: function () {
                clearTimeout(MouseEventNormalizer.mouseTrapTimeoutID);
                MouseEventNormalizer.mouseTrapTimeoutID = setTimeout(function () {
                    MouseEventNormalizer.captureMouse = false;
                    MouseEventNormalizer.bustClick = false;
                }, 400);
            }
        };
        var eventMap = {
            down: 'touchstart mousedown',
            move: 'mousemove touchmove',
            up: 'mouseup touchend touchcancel',
            cancel: 'mouseleave touchcancel'
        };
        if (support.touch && (support.mobileOS.ios || support.mobileOS.android)) {
            eventMap = {
                down: 'touchstart',
                move: 'touchmove',
                up: 'touchend touchcancel',
                cancel: 'touchcancel'
            };
        } else if (support.pointers) {
            eventMap = {
                down: 'pointerdown',
                move: 'pointermove',
                up: 'pointerup',
                cancel: 'pointercancel pointerleave'
            };
        } else if (support.msPointers) {
            eventMap = {
                down: 'MSPointerDown',
                move: 'MSPointerMove',
                up: 'MSPointerUp',
                cancel: 'MSPointerCancel MSPointerLeave'
            };
        }
        if (support.msPointers && !('onmspointerenter' in window)) {
            $.each({
                MSPointerEnter: 'MSPointerOver',
                MSPointerLeave: 'MSPointerOut'
            }, function (orig, fix) {
                $.event.special[orig] = {
                    delegateType: fix,
                    bindType: fix,
                    handle: function (event) {
                        var ret, target = this, related = event.relatedTarget, handleObj = event.handleObj;
                        if (!related || related !== target && !$.contains(target, related)) {
                            event.type = handleObj.origType;
                            ret = handleObj.handler.apply(this, arguments);
                            event.type = fix;
                        }
                        return ret;
                    }
                };
            });
        }
        var getEventMap = function (e) {
                return eventMap[e] || e;
            }, eventRegEx = /([^ ]+)/g;
        quilt.applyEventMap = function (events, ns) {
            events = events.replace(eventRegEx, getEventMap);
            if (ns) {
                events = events.replace(eventRegEx, '$1.' + ns);
            }
            return events;
        };
        quilt.keyDownHandler = function (e, widget) {
            var events = widget._events.quiltKeydown;
            if (!events) {
                return true;
            }
            events = events.slice();
            e.sender = widget;
            e.preventQuiltKeydown = false;
            for (var idx = 0, length = events.length; idx < length; idx++) {
                events[idx].call(widget, e);
            }
            return !e.preventQuiltKeydown;
        };
        var on = $.fn.on;
        function quiltJQuery(selector, context) {
            return new quiltJQuery.fn.init(selector, context);
        }
        noDepricateExtend(true, quiltJQuery, $);
        quiltJQuery.fn = quiltJQuery.prototype = new $();
        quiltJQuery.fn.constructor = quiltJQuery;
        quiltJQuery.fn.init = function (selector, context) {
            if (context && context instanceof $ && !(context instanceof quiltJQuery)) {
                context = quiltJQuery(context);
            }
            return $.fn.init.call(this, selector, context, rootjQuery);
        };
        quiltJQuery.fn.init.prototype = quiltJQuery.fn;
        var rootjQuery = quiltJQuery(document);
        extend(quiltJQuery.fn, {
            handler: function (handler) {
                this.data('handler', handler);
                return this;
            },
            autoApplyNS: function (ns) {
                this.data('quiltNS', ns || quilt.guid());
                return this;
            },
            on: function () {
                var that = this, ns = that.data('quiltNS');
                if (arguments.length === 1) {
                    return on.call(that, arguments[0]);
                }
                var context = that, args = slice.call(arguments);
                if (typeof args[args.length - 1] === UNDEFINED) {
                    args.pop();
                }
                var callback = args[args.length - 1], events = quilt.applyEventMap(args[0], ns);
                if (support.mouseAndTouchPresent && events.search(/mouse|click/) > -1 && this[0] !== document.documentElement) {
                    MouseEventNormalizer.setupMouseMute();
                    var selector = args.length === 2 ? null : args[1], bustClick = events.indexOf('click') > -1 && events.indexOf('touchend') > -1;
                    on.call(this, {
                        touchstart: MouseEventNormalizer.muteMouse,
                        touchend: MouseEventNormalizer.unMuteMouse
                    }, selector, { bustClick: bustClick });
                }
                if (arguments[0].indexOf('keydown') !== -1 && args[1] && args[1].options) {
                    args[0] = events;
                    var widget = args[1];
                    var keyDownCallBack = args[args.length - 1];
                    args[args.length - 1] = function (e) {
                        if (quilt.keyDownHandler(e, widget)) {
                            return keyDownCallBack.apply(this, [e]);
                        }
                    };
                    on.apply(that, args);
                    return that;
                }
                if (typeof callback === STRING) {
                    context = that.data('handler');
                    callback = context[callback];
                    args[args.length - 1] = function (e) {
                        callback.call(context, e);
                    };
                }
                args[0] = events;
                on.apply(that, args);
                return that;
            },
            quiltDestroy: function (ns) {
                ns = ns || this.data('quiltNS');
                if (ns) {
                    this.off('.' + ns);
                }
                return this;
            }
        });
        quilt.jQuery = quiltJQuery;
        quilt.eventMap = eventMap;
        quilt.timezone = function () {
            var months = {
                Jan: 0,
                Feb: 1,
                Mar: 2,
                Apr: 3,
                May: 4,
                Jun: 5,
                Jul: 6,
                Aug: 7,
                Sep: 8,
                Oct: 9,
                Nov: 10,
                Dec: 11
            };
            var days = {
                Sun: 0,
                Mon: 1,
                Tue: 2,
                Wed: 3,
                Thu: 4,
                Fri: 5,
                Sat: 6
            };
            function ruleToDate(year, rule) {
                var date;
                var targetDay;
                var ourDay;
                var month = rule[3];
                var on = rule[4];
                var time = rule[5];
                var cache = rule[8];
                if (!cache) {
                    rule[8] = cache = {};
                }
                if (cache[year]) {
                    return cache[year];
                }
                if (!isNaN(on)) {
                    date = new Date(Date.UTC(year, months[month], on, time[0], time[1], time[2], 0));
                } else if (on.indexOf('last') === 0) {
                    date = new Date(Date.UTC(year, months[month] + 1, 1, time[0] - 24, time[1], time[2], 0));
                    targetDay = days[on.substr(4, 3)];
                    ourDay = date.getUTCDay();
                    date.setUTCDate(date.getUTCDate() + targetDay - ourDay - (targetDay > ourDay ? 7 : 0));
                } else if (on.indexOf('>=') >= 0) {
                    date = new Date(Date.UTC(year, months[month], on.substr(5), time[0], time[1], time[2], 0));
                    targetDay = days[on.substr(0, 3)];
                    ourDay = date.getUTCDay();
                    date.setUTCDate(date.getUTCDate() + targetDay - ourDay + (targetDay < ourDay ? 7 : 0));
                } else if (on.indexOf('<=') >= 0) {
                    date = new Date(Date.UTC(year, months[month], on.substr(5), time[0], time[1], time[2], 0));
                    targetDay = days[on.substr(0, 3)];
                    ourDay = date.getUTCDay();
                    date.setUTCDate(date.getUTCDate() + targetDay - ourDay - (targetDay > ourDay ? 7 : 0));
                }
                return cache[year] = date;
            }
            function findRule(utcTime, rules, zone) {
                rules = rules[zone];
                if (!rules) {
                    var time = zone.split(':');
                    var offset = 0;
                    if (time.length > 1) {
                        offset = time[0] * 60 + Number(time[1]);
                    }
                    return [
                        -1000000,
                        'max',
                        '-',
                        'Jan',
                        1,
                        [
                            0,
                            0,
                            0
                        ],
                        offset,
                        '-'
                    ];
                }
                var year = new Date(utcTime).getUTCFullYear();
                rules = jQuery.grep(rules, function (rule) {
                    var from = rule[0];
                    var to = rule[1];
                    return from <= year && (to >= year || from == year && to == 'only' || to == 'max');
                });
                rules.push(utcTime);
                rules.sort(function (a, b) {
                    if (typeof a != 'number') {
                        a = Number(ruleToDate(year, a));
                    }
                    if (typeof b != 'number') {
                        b = Number(ruleToDate(year, b));
                    }
                    return a - b;
                });
                var rule = rules[jQuery.inArray(utcTime, rules) - 1] || rules[rules.length - 1];
                return isNaN(rule) ? rule : null;
            }
            function findZone(utcTime, zones, timezone) {
                var zoneRules = zones[timezone];
                if (typeof zoneRules === 'string') {
                    zoneRules = zones[zoneRules];
                }
                if (!zoneRules) {
                    throw new Error('Timezone "' + timezone + '" is either incorrect, or quilt.timezones.min.js is not included.');
                }
                for (var idx = zoneRules.length - 1; idx >= 0; idx--) {
                    var until = zoneRules[idx][3];
                    if (until && utcTime > until) {
                        break;
                    }
                }
                var zone = zoneRules[idx + 1];
                if (!zone) {
                    throw new Error('Timezone "' + timezone + '" not found on ' + utcTime + '.');
                }
                return zone;
            }
            function zoneAndRule(utcTime, zones, rules, timezone) {
                if (typeof utcTime != NUMBER) {
                    utcTime = Date.UTC(utcTime.getFullYear(), utcTime.getMonth(), utcTime.getDate(), utcTime.getHours(), utcTime.getMinutes(), utcTime.getSeconds(), utcTime.getMilliseconds());
                }
                var zone = findZone(utcTime, zones, timezone);
                return {
                    zone: zone,
                    rule: findRule(utcTime, rules, zone[1])
                };
            }
            function offset(utcTime, timezone) {
                if (timezone == 'Etc/UTC' || timezone == 'Etc/GMT') {
                    return 0;
                }
                var info = zoneAndRule(utcTime, this.zones, this.rules, timezone);
                var zone = info.zone;
                var rule = info.rule;
                return quilt.parseFloat(rule ? zone[0] - rule[6] : zone[0]);
            }
            function abbr(utcTime, timezone) {
                var info = zoneAndRule(utcTime, this.zones, this.rules, timezone);
                var zone = info.zone;
                var rule = info.rule;
                var base = zone[2];
                if (base.indexOf('/') >= 0) {
                    return base.split('/')[rule && +rule[6] ? 1 : 0];
                } else if (base.indexOf('%s') >= 0) {
                    return base.replace('%s', !rule || rule[7] == '-' ? '' : rule[7]);
                }
                return base;
            }
            function convert(date, fromOffset, toOffset) {
                var tempToOffset = toOffset;
                var diff;
                if (typeof fromOffset == STRING) {
                    fromOffset = this.offset(date, fromOffset);
                }
                if (typeof toOffset == STRING) {
                    toOffset = this.offset(date, toOffset);
                }
                var fromLocalOffset = date.getTimezoneOffset();
                date = new Date(date.getTime() + (fromOffset - toOffset) * 60000);
                var toLocalOffset = date.getTimezoneOffset();
                if (typeof tempToOffset == STRING) {
                    tempToOffset = this.offset(date, tempToOffset);
                }
                diff = toLocalOffset - fromLocalOffset + (toOffset - tempToOffset);
                return new Date(date.getTime() + diff * 60000);
            }
            function apply(date, timezone) {
                return this.convert(date, date.getTimezoneOffset(), timezone);
            }
            function remove(date, timezone) {
                return this.convert(date, timezone, date.getTimezoneOffset());
            }
            function toLocalDate(time) {
                return this.apply(new Date(time), 'Etc/UTC');
            }
            return {
                zones: {},
                rules: {},
                offset: offset,
                convert: convert,
                apply: apply,
                remove: remove,
                abbr: abbr,
                toLocalDate: toLocalDate
            };
        }();
        quilt.date = function () {
            var MS_PER_MINUTE = 60000, MS_PER_DAY = 86400000;
            function adjustDST(date, hours) {
                if (hours === 0 && date.getHours() === 23) {
                    date.setHours(date.getHours() + 2);
                    return true;
                }
                return false;
            }
            function setDayOfWeek(date, day, dir) {
                var hours = date.getHours();
                dir = dir || 1;
                day = (day - date.getDay() + 7 * dir) % 7;
                date.setDate(date.getDate() + day);
                adjustDST(date, hours);
            }
            function dayOfWeek(date, day, dir) {
                date = new Date(date);
                setDayOfWeek(date, day, dir);
                return date;
            }
            function firstDayOfMonth(date) {
                return new Date(date.getFullYear(), date.getMonth(), 1);
            }
            function lastDayOfMonth(date) {
                var last = new Date(date.getFullYear(), date.getMonth() + 1, 0), first = firstDayOfMonth(date), timeOffset = Math.abs(last.getTimezoneOffset() - first.getTimezoneOffset());
                if (timeOffset) {
                    last.setHours(first.getHours() + timeOffset / 60);
                }
                return last;
            }
            function firstDayOfYear(date) {
                return new Date(date.getFullYear(), 0, 1);
            }
            function lastDayOfYear(date) {
                return new Date(date.getFullYear(), 11, 31);
            }
            function moveDateToWeekStart(date, weekStartDay) {
                if (weekStartDay !== 1) {
                    return addDays(dayOfWeek(date, weekStartDay, -1), 4);
                }
                return addDays(date, 4 - (date.getDay() || 7));
            }
            function calcWeekInYear(date, weekStartDay) {
                var firstWeekInYear = new Date(date.getFullYear(), 0, 1, -6);
                var newDate = moveDateToWeekStart(date, weekStartDay);
                var diffInMS = newDate.getTime() - firstWeekInYear.getTime();
                var days = Math.floor(diffInMS / MS_PER_DAY);
                return 1 + Math.floor(days / 7);
            }
            function weekInYear(date, weekStartDay) {
                if (weekStartDay === undefined) {
                    weekStartDay = quilt.culture().calendar.firstDay;
                }
                var prevWeekDate = addDays(date, -7);
                var nextWeekDate = addDays(date, 7);
                var weekNumber = calcWeekInYear(date, weekStartDay);
                if (weekNumber === 0) {
                    return calcWeekInYear(prevWeekDate, weekStartDay) + 1;
                }
                if (weekNumber === 53 && calcWeekInYear(nextWeekDate, weekStartDay) > 1) {
                    return 1;
                }
                return weekNumber;
            }
            function getDate(date) {
                date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
                adjustDST(date, 0);
                return date;
            }
            function toUtcTime(date) {
                return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
            }
            function getMilliseconds(date) {
                return toInvariantTime(date).getTime() - getDate(toInvariantTime(date));
            }
            function isInTimeRange(value, min, max) {
                var msMin = getMilliseconds(min), msMax = getMilliseconds(max), msValue;
                if (!value || msMin == msMax) {
                    return true;
                }
                if (min >= max) {
                    max += MS_PER_DAY;
                }
                msValue = getMilliseconds(value);
                if (msMin > msValue) {
                    msValue += MS_PER_DAY;
                }
                if (msMax < msMin) {
                    msMax += MS_PER_DAY;
                }
                return msValue >= msMin && msValue <= msMax;
            }
            function isInDateRange(value, min, max) {
                var msMin = min.getTime(), msMax = max.getTime(), msValue;
                if (msMin >= msMax) {
                    msMax += MS_PER_DAY;
                }
                msValue = value.getTime();
                return msValue >= msMin && msValue <= msMax;
            }
            function addDays(date, offset) {
                var hours = date.getHours();
                date = new Date(date);
                setTime(date, offset * MS_PER_DAY);
                adjustDST(date, hours);
                return date;
            }
            function setTime(date, milliseconds, ignoreDST) {
                var offset = date.getTimezoneOffset();
                var difference;
                date.setTime(date.getTime() + milliseconds);
                if (!ignoreDST) {
                    difference = date.getTimezoneOffset() - offset;
                    date.setTime(date.getTime() + difference * MS_PER_MINUTE);
                }
            }
            function setHours(date, time) {
                date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
                adjustDST(date, time.getHours());
                return date;
            }
            function today() {
                return getDate(new Date());
            }
            function isToday(date) {
                return getDate(date).getTime() == today().getTime();
            }
            function toInvariantTime(date) {
                var staticDate = new Date(1980, 1, 1, 0, 0, 0);
                if (date) {
                    staticDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
                }
                return staticDate;
            }
            function addYear(date, offset) {
                var currentDate = new Date(date);
                return new Date(currentDate.setFullYear(currentDate.getFullYear() + offset));
            }
            return {
                adjustDST: adjustDST,
                dayOfWeek: dayOfWeek,
                setDayOfWeek: setDayOfWeek,
                getDate: getDate,
                isInDateRange: isInDateRange,
                isInTimeRange: isInTimeRange,
                isToday: isToday,
                nextDay: function (date) {
                    return addDays(date, 1);
                },
                previousDay: function (date) {
                    return addDays(date, -1);
                },
                toUtcTime: toUtcTime,
                MS_PER_DAY: MS_PER_DAY,
                MS_PER_HOUR: 60 * MS_PER_MINUTE,
                MS_PER_MINUTE: MS_PER_MINUTE,
                setTime: setTime,
                setHours: setHours,
                addDays: addDays,
                today: today,
                toInvariantTime: toInvariantTime,
                firstDayOfMonth: firstDayOfMonth,
                lastDayOfMonth: lastDayOfMonth,
                weekInYear: weekInYear,
                getMilliseconds: getMilliseconds,
                firstDayOfYear: firstDayOfYear,
                lastDayOfYear: lastDayOfYear,
                nextYear: function (date) {
                    return addYear(date, 1);
                },
                previousYear: function (date) {
                    return addYear(date, -1);
                }
            };
        }();
        quilt.stripWhitespace = function (element) {
            if (document.createNodeIterator) {
                var iterator = document.createNodeIterator(element, NodeFilter.SHOW_TEXT, function (node) {
                    return node.parentNode == element ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }, false);
                while (iterator.nextNode()) {
                    if (iterator.referenceNode && !iterator.referenceNode.textContent.trim()) {
                        iterator.referenceNode.parentNode.removeChild(iterator.referenceNode);
                    }
                }
            } else {
                for (var i = 0; i < element.childNodes.length; i++) {
                    var child = element.childNodes[i];
                    if (child.nodeType == 3 && !/\S/.test(child.nodeValue)) {
                        element.removeChild(child);
                        i--;
                    }
                    if (child.nodeType == 1) {
                        quilt.stripWhitespace(child);
                    }
                }
            }
        };
        var animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
            setTimeout(callback, 1000 / 60);
        };
        quilt.animationFrame = function (callback) {
            animationFrame.call(window, callback);
        };
        var animationQueue = [];
        quilt.queueAnimation = function (callback) {
            animationQueue[animationQueue.length] = callback;
            if (animationQueue.length === 1) {
                quilt.runNextAnimation();
            }
        };
        quilt.runNextAnimation = function () {
            quilt.animationFrame(function () {
                if (animationQueue[0]) {
                    animationQueue.shift()();
                    if (animationQueue[0]) {
                        quilt.runNextAnimation();
                    }
                }
            });
        };
        quilt.parseQueryStringParams = function (url) {
            var queryString = url.split('?')[1] || '', params = {}, paramParts = queryString.split(/&|=/), length = paramParts.length, idx = 0;
            for (; idx < length; idx += 2) {
                if (paramParts[idx] !== '') {
                    params[decodeURIComponent(paramParts[idx])] = decodeURIComponent(paramParts[idx + 1]);
                }
            }
            return params;
        };
        quilt.elementUnderCursor = function (e) {
            if (typeof e.x.client != 'undefined') {
                return document.elementFromPoint(e.x.client, e.y.client);
            }
        };
        quilt.wheelDeltaY = function (jQueryEvent) {
            var e = jQueryEvent.originalEvent, deltaY = e.wheelDeltaY, delta;
            if (e.wheelDelta) {
                if (deltaY === undefined || deltaY) {
                    delta = e.wheelDelta;
                }
            } else if (e.detail && e.axis === e.VERTICAL_AXIS) {
                delta = -e.detail * 10;
            }
            return delta;
        };
        quilt.throttle = function (fn, delay) {
            var timeout;
            var lastExecTime = 0;
            if (!delay || delay <= 0) {
                return fn;
            }
            var throttled = function () {
                var that = this;
                var elapsed = +new Date() - lastExecTime;
                var args = arguments;
                function exec() {
                    fn.apply(that, args);
                    lastExecTime = +new Date();
                }
                if (!lastExecTime) {
                    return exec();
                }
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (elapsed > delay) {
                    exec();
                } else {
                    timeout = setTimeout(exec, delay - elapsed);
                }
            };
            throttled.cancel = function () {
                clearTimeout(timeout);
            };
            return throttled;
        };
        quilt.caret = function (element, start, end) {
            var rangeElement;
            var isPosition = start !== undefined;
            if (end === undefined) {
                end = start;
            }
            if (element[0]) {
                element = element[0];
            }
            if (isPosition && element.disabled) {
                return;
            }
            try {
                if (element.selectionStart !== undefined) {
                    if (isPosition) {
                        element.focus();
                        var mobile = support.mobileOS;
                        if (mobile.wp || mobile.android) {
                            setTimeout(function () {
                                element.setSelectionRange(start, end);
                            }, 0);
                        } else {
                            element.setSelectionRange(start, end);
                        }
                    } else {
                        start = [
                            element.selectionStart,
                            element.selectionEnd
                        ];
                    }
                } else if (document.selection) {
                    if ($(element).is(':visible')) {
                        element.focus();
                    }
                    rangeElement = element.createTextRange();
                    if (isPosition) {
                        rangeElement.collapse(true);
                        rangeElement.moveStart('character', start);
                        rangeElement.moveEnd('character', end - start);
                        rangeElement.select();
                    } else {
                        var rangeDuplicated = rangeElement.duplicate(), selectionStart, selectionEnd;
                        rangeElement.moveToBookmark(document.selection.createRange().getBookmark());
                        rangeDuplicated.setEndPoint('EndToStart', rangeElement);
                        selectionStart = rangeDuplicated.text.length;
                        selectionEnd = selectionStart + rangeElement.text.length;
                        start = [
                            selectionStart,
                            selectionEnd
                        ];
                    }
                }
            } catch (e) {
                start = [];
            }
            return start;
        };
        quilt.compileMobileDirective = function (element, scope) {
            var angular = window.angular;
            element.attr('data-' + quilt.ns + 'role', element[0].tagName.toLowerCase().replace('quilt-mobile-', '').replace('-', ''));
            angular.element(element).injector().invoke([
                '$compile',
                function ($compile) {
                    $compile(element)(scope);
                    if (!/^\$(digest|apply)$/.test(scope.$$phase)) {
                        scope.$digest();
                    }
                }
            ]);
            return quilt.widgetInstance(element, quilt.mobile.ui);
        };
        quilt.antiForgeryTokens = function () {
            var tokens = {}, csrf_token = $('meta[name=csrf-token],meta[name=_csrf]').attr('content'), csrf_param = $('meta[name=csrf-param],meta[name=_csrf_header]').attr('content');
            $('input[name^=\'__RequestVerificationToken\']').each(function () {
                tokens[this.name] = this.value;
            });
            if (csrf_param !== undefined && csrf_token !== undefined) {
                tokens[csrf_param] = csrf_token;
            }
            return tokens;
        };
        quilt.cycleForm = function (form) {
            var firstElement = form.find('input, .k-widget').first();
            var lastElement = form.find('button, .k-button').last();
            function focus(el) {
                var widget = quilt.widgetInstance(el);
                if (widget && widget.focus) {
                    widget.focus();
                } else {
                    el.focus();
                }
            }
            lastElement.on('keydown', function (e) {
                if (e.keyCode == quilt.keys.TAB && !e.shiftKey) {
                    e.preventDefault();
                    focus(firstElement);
                }
            });
            firstElement.on('keydown', function (e) {
                if (e.keyCode == quilt.keys.TAB && e.shiftKey) {
                    e.preventDefault();
                    focus(lastElement);
                }
            });
        };
        quilt.focusElement = function (element) {
            var scrollTopPositions = [];
            var scrollableParents = element.parentsUntil('body').filter(function (index, element) {
                var computedStyle = quilt.getComputedStyles(element, ['overflow']);
                return computedStyle.overflow !== 'visible';
            }).add(window);
            scrollableParents.each(function (index, parent) {
                scrollTopPositions[index] = $(parent).scrollTop();
            });
            try {
                element[0].setActive();
            } catch (e) {
                element[0].focus();
            }
            scrollableParents.each(function (index, parent) {
                $(parent).scrollTop(scrollTopPositions[index]);
            });
        };
        quilt.focusNextElement = function () {
            if (document.activeElement) {
                var focussable = $(':quiltFocusable');
                var index = focussable.index(document.activeElement);
                if (index > -1) {
                    var nextElement = focussable[index + 1] || focussable[0];
                    nextElement.focus();
                }
            }
        };
        quilt.trim = function (value) {
            if (!!value) {
                return value.toString().trim();
            } else {
                return '';
            }
        };
        quilt.getWidgetFocusableElement = function (element) {
            var nextFocusable = element.closest(':quiltFocusable'), widgetInstance = quilt.widgetInstance(element), target;
            if (nextFocusable.length) {
                target = nextFocusable;
            } else if (widgetInstance) {
                target = widgetInstance.options.name === 'Editor' ? $(widgetInstance.body) : widgetInstance.wrapper.find(':quiltFocusable').first();
            } else {
                target = element;
            }
            return target;
        };
        quilt.addAttribute = function (element, attribute, value) {
            var current = element.attr(attribute) || '';
            if (current.indexOf(value) < 0) {
                element.attr(attribute, (current + ' ' + value).trim());
            }
        };
        quilt.removeAttribute = function (element, attribute, value) {
            var current = element.attr(attribute) || '';
            element.attr(attribute, current.replace(value, '').trim());
        };
        quilt.toggleAttribute = function (element, attribute, value) {
            var current = element.attr(attribute) || '';
            if (current.indexOf(value) < 0) {
                quilt.addAttribute(element, attribute, value);
            } else {
                quilt.removeAttribute(element, attribute, value);
            }
        };
        quilt.matchesMedia = function (mediaQuery) {
            var media = quilt._bootstrapToMedia(mediaQuery) || mediaQuery;
            return support.matchMedia && window.matchMedia(media).matches;
        };
        quilt._bootstrapToMedia = function (bootstrapMedia) {
            return {
                'xs': '(max-width: 576px)',
                'sm': '(min-width: 576px)',
                'md': '(min-width: 768px)',
                'lg': '(min-width: 992px)',
                'xl': '(min-width: 1200px)'
            }[bootstrapMedia];
        };
        quilt.fileGroupMap = {
            audio: [
                '.aif',
                '.iff',
                '.m3u',
                '.m4a',
                '.mid',
                '.mp3',
                '.mpa',
                '.wav',
                '.wma',
                '.ogg',
                '.wav',
                '.wma',
                '.wpl'
            ],
            video: [
                '.3g2',
                '.3gp',
                '.avi',
                '.asf',
                '.flv',
                '.m4u',
                '.rm',
                '.h264',
                '.m4v',
                '.mkv',
                '.mov',
                '.mp4',
                '.mpg',
                '.rm',
                '.swf',
                '.vob',
                '.wmv'
            ],
            image: [
                '.ai',
                '.dds',
                '.heic',
                '.jpe',
                'jfif',
                '.jif',
                '.jp2',
                '.jps',
                '.eps',
                '.bmp',
                '.gif',
                '.jpeg',
                '.jpg',
                '.png',
                '.ps',
                '.psd',
                '.svg',
                '.svgz',
                '.tif',
                '.tiff'
            ],
            txt: [
                '.doc',
                '.docx',
                '.log',
                '.pages',
                '.tex',
                '.wpd',
                '.wps',
                '.odt',
                '.rtf',
                '.text',
                '.txt',
                '.wks'
            ],
            presentation: [
                '.key',
                '.odp',
                '.pps',
                '.ppt',
                '.pptx'
            ],
            data: [
                '.xlr',
                '.xls',
                '.xlsx'
            ],
            programming: [
                '.tmp',
                '.bak',
                '.msi',
                '.cab',
                '.cpl',
                '.cur',
                '.dll',
                '.dmp',
                '.drv',
                '.icns',
                '.ico',
                '.link',
                '.sys',
                '.cfg',
                '.ini',
                '.asp',
                '.aspx',
                '.cer',
                '.csr',
                '.css',
                '.dcr',
                '.htm',
                '.html',
                '.js',
                '.php',
                '.rss',
                '.xhtml'
            ],
            pdf: ['.pdf'],
            config: [
                '.apk',
                '.app',
                '.bat',
                '.cgi',
                '.com',
                '.exe',
                '.gadget',
                '.jar',
                '.wsf'
            ],
            zip: [
                '.7z',
                '.cbr',
                '.gz',
                '.sitx',
                '.arj',
                '.deb',
                '.pkg',
                '.rar',
                '.rpm',
                '.tar.gz',
                '.z',
                '.zip',
                '.zipx'
            ],
            'disc-image': [
                '.dmg',
                '.iso',
                '.toast',
                '.vcd',
                '.bin',
                '.cue',
                '.mdf'
            ]
        };
        quilt.getFileGroup = function (extension, withPrefix) {
            var fileTypeMap = quilt.fileGroupMap;
            var groups = Object.keys(fileTypeMap);
            var type = 'file';
            if (extension === undefined || !extension.length) {
                return type;
            }
            for (var i = 0; i < groups.length; i += 1) {
                var extensions = fileTypeMap[groups[i]];
                if (extensions.indexOf(extension.toLowerCase()) > -1) {
                    return withPrefix ? 'file-' + groups[i] : groups[i];
                }
            }
            return type;
        };
        quilt.getFileSizeMessage = function (size) {
            var sizes = [
                'Bytes',
                'KB',
                'MB',
                'GB',
                'TB'
            ];
            if (size === 0) {
                return '0 Byte';
            }
            var i = parseInt(Math.floor(Math.log(size) / Math.log(1024)), 10);
            return Math.round(size / Math.pow(1024, i), 2) + ' ' + sizes[i];
        };
        quilt.selectorFromClasses = function (classes) {
            return '.' + classes.split(' ').join('.');
        };
        var themeColorValues = [
            'primary',
            'secondary',
            'tertiary',
            'inherit',
            'info',
            'success',
            'warning',
            'error',
            'dark',
            'light',
            'inverse'
        ];
        var fillValues = [
            'solid',
            'outline',
            'flat'
        ];
        var postitionValues = [
            'edge',
            'outside',
            'inside'
        ];
        var shapeValues = [
            'circle',
            'rectangle',
            'rounded',
            'dot',
            'pill'
        ];
        var sizeValues = [
            [
                'small',
                'sm'
            ],
            [
                'medium',
                'md'
            ],
            [
                'large',
                'lg'
            ]
        ];
        var alignValues = [
            [
                'top start',
                'top-start'
            ],
            [
                'top end',
                'top-end'
            ],
            [
                'bottom start',
                'bottom-start'
            ],
            [
                'bottom end',
                'bottom-end'
            ]
        ];
        var positionModeValues = [
            'fixed',
            'static',
            'sticky',
            'absolute'
        ];
        quilt.propertyToCssClassMap = {};
        quilt.registerCssClass = function (propName, value, shorthand) {
            if (!quilt.propertyToCssClassMap[propName]) {
                quilt.propertyToCssClassMap[propName] = {};
            }
            quilt.propertyToCssClassMap[propName][value] = shorthand || value;
        };
        quilt.registerCssClasses = function (propName, arr) {
            for (var i = 0; i < arr.length; i++) {
                if (isArray(arr[i])) {
                    quilt.registerCssClass(propName, arr[i][0], arr[i][1]);
                } else {
                    quilt.registerCssClass(propName, arr[i]);
                }
            }
        };
        quilt.getValidCssClass = function (prefix, propName, value) {
            var validValue = quilt.propertyToCssClassMap[propName][value];
            if (validValue) {
                return prefix + validValue;
            }
        };
        quilt.registerCssClasses('themeColor', themeColorValues);
        quilt.registerCssClasses('fill', fillValues);
        quilt.registerCssClasses('postition', postitionValues);
        quilt.registerCssClasses('shape', shapeValues);
        quilt.registerCssClasses('size', sizeValues);
        quilt.registerCssClasses('align', alignValues);
        quilt.registerCssClasses('positionMode', positionModeValues);
        quilt.whenAll = function (array) {
            var resolveValues = arguments.length == 1 && $.isArray(array) ? array : Array.prototype.slice.call(arguments), length = resolveValues.length, remaining = length, deferred = $.Deferred(), i = 0, failed = 0, rejectContexts = Array(length), rejectValues = Array(length), resolveContexts = Array(length), value;
            function updateFunc(index, contexts, values) {
                return function () {
                    if (values != resolveValues) {
                        failed++;
                    }
                    deferred.notifyWith(contexts[index] = this, values[index] = Array.prototype.slice.call(arguments));
                    if (!--remaining) {
                        deferred[(!failed ? 'resolve' : 'reject') + 'With'](contexts, values);
                    }
                };
            }
            for (; i < length; i++) {
                if ((value = resolveValues[i]) && $.isFunction(value.promise)) {
                    value.promise().done(updateFunc(i, resolveContexts, resolveValues)).fail(updateFunc(i, rejectContexts, rejectValues));
                } else {
                    deferred.notifyWith(this, value);
                    --remaining;
                }
            }
            if (!remaining) {
                deferred.resolveWith(resolveContexts, resolveValues);
            }
            return deferred.promise();
        };
        (function () {
            function postToProxy(dataURI, fileName, proxyURL, proxyTarget) {
                var form = $('<form>').attr({
                    action: proxyURL,
                    method: 'POST',
                    target: proxyTarget
                });
                var data = quilt.antiForgeryTokens();
                data.fileName = fileName;
                var parts = dataURI.split(';base64,');
                data.contentType = parts[0].replace('data:', '');
                data.base64 = parts[1];
                for (var name in data) {
                    if (data.hasOwnProperty(name)) {
                        $('<input>').attr({
                            value: data[name],
                            name: name,
                            type: 'hidden'
                        }).appendTo(form);
                    }
                }
                form.appendTo('body').submit().remove();
            }
            var fileSaver = document.createElement('a');
            var downloadAttribute = 'download' in fileSaver && !quilt.support.browser.edge;
            function saveAsBlob(dataURI, fileName) {
                var blob = dataURI;
                if (typeof dataURI == 'string') {
                    var parts = dataURI.split(';base64,');
                    var contentType = parts[0];
                    var base64 = atob(parts[1]);
                    var array = new Uint8Array(base64.length);
                    for (var idx = 0; idx < base64.length; idx++) {
                        array[idx] = base64.charCodeAt(idx);
                    }
                    blob = new Blob([array.buffer], { type: contentType });
                }
                navigator.msSaveBlob(blob, fileName);
            }
            function saveAsDataURI(dataURI, fileName) {
                if (window.Blob && dataURI instanceof Blob) {
                    dataURI = URL.createObjectURL(dataURI);
                }
                fileSaver.download = fileName;
                fileSaver.href = dataURI;
                var e = document.createEvent('MouseEvents');
                e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                fileSaver.dispatchEvent(e);
                setTimeout(function () {
                    URL.revokeObjectURL(dataURI);
                });
            }
            quilt.saveAs = function (options) {
                var save = postToProxy;
                if (!options.forceProxy) {
                    if (downloadAttribute) {
                        save = saveAsDataURI;
                    } else if (navigator.msSaveBlob) {
                        save = saveAsBlob;
                    }
                }
                save(options.dataURI, options.fileName, options.proxyURL, options.proxyTarget);
            };
        }());
        quilt.proxyModelSetters = function proxyModelSetters(data) {
            var observable = {};
            Object.keys(data || {}).forEach(function (property) {
                Object.defineProperty(observable, property, {
                    get: function () {
                        return data[property];
                    },
                    set: function (value) {
                        data[property] = value;
                        data.dirty = true;
                    }
                });
            });
            return observable;
        };
        (function () {
            quilt.defaults = quilt.defaults || {};
            quilt.setDefaults = function (key, value) {
                var path = key.split('.');
                var curr = quilt.defaults;
                key = path.pop();
                path.forEach(function (part) {
                    if (curr[part] === undefined) {
                        curr[part] = {};
                    }
                    curr = curr[part];
                });
                if (value.constructor === Object) {
                    curr[key] = deepExtend({}, curr[key], value);
                } else {
                    curr[key] = value;
                }
            };
        }());
    }(jQuery, window));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.router', ['quilt.core'], f);
}(function () {
    var __meta__ = {
        id: 'router',
        name: 'Router',
        category: 'framework',
        description: 'The Router class is responsible for tracking the application state and navigating between the application states.',
        depends: ['core'],
        hidden: false
    };
    (function ($, undefined) {
        var quilt = window.quilt, CHANGE = 'change', BACK = 'back', SAME = 'same', support = quilt.support, location = window.location, history = window.history, CHECK_URL_INTERVAL = 50, BROKEN_BACK_NAV = quilt.support.browser.msie, hashStrip = /^#*/, document = window.document;
        function absoluteURL(path, pathPrefix) {
            if (!pathPrefix) {
                return path;
            }
            if (path + '/' === pathPrefix) {
                path = pathPrefix;
            }
            var regEx = new RegExp('^' + pathPrefix, 'i');
            if (!regEx.test(path)) {
                path = pathPrefix + '/' + path;
            }
            return location.protocol + '//' + (location.host + '/' + path).replace(/\/\/+/g, '/');
        }
        function hashDelimiter(bang) {
            return bang ? '#!' : '#';
        }
        function locationHash(hashDelimiter) {
            var href = location.href;
            if (hashDelimiter === '#!' && href.indexOf('#') > -1 && href.indexOf('#!') < 0) {
                return null;
            }
            return href.split(hashDelimiter)[1] || '';
        }
        function stripRoot(root, url) {
            if (url.indexOf(root) === 0) {
                return url.substr(root.length).replace(/\/\//g, '/');
            } else {
                return url;
            }
        }
        var HistoryAdapter = quilt.Class.extend({
            back: function () {
                if (BROKEN_BACK_NAV) {
                    setTimeout(function () {
                        history.back();
                    });
                } else {
                    history.back();
                }
            },
            forward: function () {
                if (BROKEN_BACK_NAV) {
                    setTimeout(function () {
                        history.forward();
                    });
                } else {
                    history.forward();
                }
            },
            length: function () {
                return history.length;
            },
            replaceLocation: function (url) {
                location.replace(url);
            }
        });
        var PushStateAdapter = HistoryAdapter.extend({
            init: function (root) {
                this.root = root;
            },
            navigate: function (to) {
                history.pushState({}, document.title, absoluteURL(to, this.root));
            },
            replace: function (to) {
                history.replaceState({}, document.title, absoluteURL(to, this.root));
            },
            normalize: function (url) {
                return stripRoot(this.root, url);
            },
            current: function () {
                var current = location.pathname;
                if (location.search) {
                    current += location.search;
                }
                return stripRoot(this.root, current);
            },
            change: function (callback) {
                $(window).bind('popstate.quilt', callback);
            },
            stop: function () {
                $(window).unbind('popstate.quilt');
            },
            normalizeCurrent: function (options) {
                var fixedUrl, root = options.root, pathname = location.pathname, hash = locationHash(hashDelimiter(options.hashBang));
                if (root === pathname + '/') {
                    fixedUrl = root;
                }
                if (root === pathname && hash) {
                    fixedUrl = absoluteURL(hash.replace(hashStrip, ''), root);
                }
                if (fixedUrl) {
                    history.pushState({}, document.title, fixedUrl);
                }
            }
        });
        function fixHash(url) {
            return url.replace(/^(#)?/, '#');
        }
        function fixBang(url) {
            return url.replace(/^(#(!)?)?/, '#!');
        }
        var HashAdapter = HistoryAdapter.extend({
            init: function (bang) {
                this._id = quilt.guid();
                this.prefix = hashDelimiter(bang);
                this.fix = bang ? fixBang : fixHash;
            },
            navigate: function (to) {
                location.hash = this.fix(to);
            },
            replace: function (to) {
                this.replaceLocation(this.fix(to));
            },
            normalize: function (url) {
                if (url.indexOf(this.prefix) < 0) {
                    return url;
                } else {
                    return url.split(this.prefix)[1];
                }
            },
            change: function (callback) {
                if (support.hashChange) {
                    $(window).on('hashchange.' + this._id, callback);
                } else {
                    this._interval = setInterval(callback, CHECK_URL_INTERVAL);
                }
            },
            stop: function () {
                $(window).off('hashchange.' + this._id);
                clearInterval(this._interval);
            },
            current: function () {
                return locationHash(this.prefix);
            },
            normalizeCurrent: function (options) {
                var pathname = location.pathname, root = options.root;
                if (options.pushState && root !== pathname) {
                    this.replaceLocation(root + this.prefix + stripRoot(root, pathname));
                    return true;
                }
                return false;
            }
        });
        var History = quilt.Observable.extend({
            start: function (options) {
                options = options || {};
                this.bind([
                    CHANGE,
                    BACK,
                    SAME
                ], options);
                if (this._started) {
                    return;
                }
                this._started = true;
                options.root = options.root || '/';
                var adapter = this.createAdapter(options), current;
                if (adapter.normalizeCurrent(options)) {
                    return;
                }
                current = adapter.current();
                $.extend(this, {
                    adapter: adapter,
                    root: options.root,
                    historyLength: adapter.length(),
                    current: current,
                    locations: [current]
                });
                adapter.change($.proxy(this, '_checkUrl'));
            },
            createAdapter: function (options) {
                return support.pushState && options.pushState ? new PushStateAdapter(options.root) : new HashAdapter(options.hashBang);
            },
            stop: function () {
                if (!this._started) {
                    return;
                }
                this.adapter.stop();
                this.unbind(CHANGE);
                this._started = false;
            },
            change: function (callback) {
                this.bind(CHANGE, callback);
            },
            replace: function (to, silent) {
                this._navigate(to, silent, function (adapter) {
                    adapter.replace(to);
                    this.locations[this.locations.length - 1] = this.current;
                });
            },
            navigate: function (to, silent) {
                if (to === '#:back') {
                    this.backCalled = true;
                    this.adapter.back();
                    return;
                }
                this._navigate(to, silent, function (adapter) {
                    adapter.navigate(to);
                    this.locations.push(this.current);
                });
            },
            _navigate: function (to, silent, callback) {
                var adapter = this.adapter;
                to = adapter.normalize(to);
                if (this.current === to || this.current === decodeURIComponent(to)) {
                    this.trigger(SAME);
                    return;
                }
                if (!silent) {
                    if (this.trigger(CHANGE, {
                            url: to,
                            decode: false
                        })) {
                        return;
                    }
                }
                this.current = to;
                callback.call(this, adapter);
                this.historyLength = adapter.length();
            },
            _checkUrl: function () {
                var adapter = this.adapter, current = adapter.current(), newLength = adapter.length(), navigatingInExisting = this.historyLength === newLength, back = current === this.locations[this.locations.length - 2] && navigatingInExisting, backCalled = this.backCalled, prev = this.current;
                if (current === null || this.current === current || this.current === decodeURIComponent(current)) {
                    return true;
                }
                this.historyLength = newLength;
                this.backCalled = false;
                this.current = current;
                if (back && this.trigger('back', {
                        url: prev,
                        to: current
                    })) {
                    adapter.forward();
                    this.current = prev;
                    return;
                }
                if (this.trigger(CHANGE, {
                        url: current,
                        backButtonPressed: !backCalled
                    })) {
                    if (back) {
                        adapter.forward();
                    } else {
                        adapter.back();
                        this.historyLength--;
                    }
                    this.current = prev;
                    return;
                }
                if (back) {
                    this.locations.pop();
                } else {
                    this.locations.push(current);
                }
            }
        });
        quilt.History = History;
        quilt.History.HistoryAdapter = HistoryAdapter;
        quilt.History.HashAdapter = HashAdapter;
        quilt.History.PushStateAdapter = PushStateAdapter;
        quilt.absoluteURL = absoluteURL;
        quilt.history = new History();
    }(window.quilt.jQuery));
    (function () {
        var quilt = window.quilt, history = quilt.history, Observable = quilt.Observable, INIT = 'init', ROUTE_MISSING = 'routeMissing', CHANGE = 'change', BACK = 'back', SAME = 'same', optionalParam = /\((.*?)\)/g, namedParam = /(\(\?)?:\w+/g, splatParam = /\*\w+/g, escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;
        function namedParamReplace(match, optional) {
            return optional ? match : '([^/]+)';
        }
        function routeToRegExp(route, ignoreCase) {
            return new RegExp('^' + route.replace(escapeRegExp, '\\$&').replace(optionalParam, '(?:$1)?').replace(namedParam, namedParamReplace).replace(splatParam, '(.*?)') + '$', ignoreCase ? 'i' : '');
        }
        function stripUrl(url) {
            return url.replace(/(\?.*)|(#.*)/g, '');
        }
        var Route = quilt.Class.extend({
            init: function (route, callback, ignoreCase) {
                if (!(route instanceof RegExp)) {
                    route = routeToRegExp(route, ignoreCase);
                }
                this.route = route;
                this._callback = callback;
            },
            callback: function (url, back, decode) {
                var params, idx = 0, length, queryStringParams = quilt.parseQueryStringParams(url);
                queryStringParams._back = back;
                url = stripUrl(url);
                params = this.route.exec(url).slice(1);
                length = params.length;
                if (decode) {
                    for (; idx < length; idx++) {
                        if (typeof params[idx] !== 'undefined') {
                            params[idx] = decodeURIComponent(params[idx]);
                        }
                    }
                }
                params.push(queryStringParams);
                this._callback.apply(null, params);
            },
            worksWith: function (url, back, decode) {
                if (this.route.test(stripUrl(url))) {
                    this.callback(url, back, decode);
                    return true;
                } else {
                    return false;
                }
            }
        });
        var Router = Observable.extend({
            init: function (options) {
                if (!options) {
                    options = {};
                }
                Observable.fn.init.call(this);
                this.routes = [];
                this.pushState = options.pushState;
                this.hashBang = options.hashBang;
                this.root = options.root;
                this.ignoreCase = options.ignoreCase !== false;
                this.bind([
                    INIT,
                    ROUTE_MISSING,
                    CHANGE,
                    SAME,
                    BACK
                ], options);
            },
            destroy: function () {
                history.unbind(CHANGE, this._urlChangedProxy);
                history.unbind(SAME, this._sameProxy);
                history.unbind(BACK, this._backProxy);
                this.unbind();
            },
            start: function () {
                var that = this, sameProxy = function () {
                        that._same();
                    }, backProxy = function (e) {
                        that._back(e);
                    }, urlChangedProxy = function (e) {
                        that._urlChanged(e);
                    };
                history.start({
                    same: sameProxy,
                    change: urlChangedProxy,
                    back: backProxy,
                    pushState: that.pushState,
                    hashBang: that.hashBang,
                    root: that.root
                });
                var initEventObject = {
                    url: history.current || '/',
                    preventDefault: $.noop
                };
                if (!that.trigger(INIT, initEventObject)) {
                    that._urlChanged(initEventObject);
                }
                this._urlChangedProxy = urlChangedProxy;
                this._backProxy = backProxy;
            },
            route: function (route, callback) {
                this.routes.push(new Route(route, callback, this.ignoreCase));
            },
            navigate: function (url, silent) {
                quilt.history.navigate(url, silent);
            },
            replace: function (url, silent) {
                quilt.history.replace(url, silent);
            },
            _back: function (e) {
                if (this.trigger(BACK, {
                        url: e.url,
                        to: e.to
                    })) {
                    e.preventDefault();
                }
            },
            _same: function () {
                this.trigger(SAME);
            },
            _urlChanged: function (e) {
                var url = e.url;
                var decode = !!e.decode;
                var back = e.backButtonPressed;
                if (!url) {
                    url = '/';
                }
                if (this.trigger(CHANGE, {
                        url: e.url,
                        params: quilt.parseQueryStringParams(e.url),
                        backButtonPressed: back
                    })) {
                    e.preventDefault();
                    return;
                }
                var idx = 0, routes = this.routes, route, length = routes.length;
                for (; idx < length; idx++) {
                    route = routes[idx];
                    if (route.worksWith(url, back, decode)) {
                        return;
                    }
                }
                if (this.trigger(ROUTE_MISSING, {
                        url: url,
                        params: quilt.parseQueryStringParams(url),
                        backButtonPressed: back
                    })) {
                    e.preventDefault();
                }
            }
        });
        quilt.Router = Router;
    }());
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.touch', [
        'quilt.core',
        'quilt.userevents'
    ], f);
}(function () {
    var __meta__ = {
        id: 'touch',
        name: 'Touch',
        category: 'mobile',
        description: 'The quilt Touch widget provides a cross-platform compatible API for handling user-initiated touch events, multi-touch gestures and event sequences (drag, swipe, etc.). ',
        depends: [
            'core',
            'userevents'
        ]
    };
    (function ($, undefined) {
        var quilt = window.quilt, Widget = quilt.ui.Widget, proxy = $.proxy, abs = Math.abs, MAX_DOUBLE_TAP_DISTANCE = 20;
        var Touch = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                options = that.options;
                element = that.element;
                that.wrapper = element;
                function eventProxy(name) {
                    return function (e) {
                        that._triggerTouch(name, e);
                    };
                }
                function gestureEventProxy(name) {
                    return function (e) {
                        that.trigger(name, {
                            touches: e.touches,
                            distance: e.distance,
                            center: e.center,
                            event: e.event
                        });
                    };
                }
                that.events = new quilt.UserEvents(element, {
                    filter: options.filter,
                    surface: options.surface,
                    minHold: options.minHold,
                    multiTouch: options.multiTouch,
                    allowSelection: true,
                    fastTap: options.fastTap,
                    press: eventProxy('touchstart'),
                    hold: eventProxy('hold'),
                    tap: proxy(that, '_tap'),
                    gesturestart: gestureEventProxy('gesturestart'),
                    gesturechange: gestureEventProxy('gesturechange'),
                    gestureend: gestureEventProxy('gestureend')
                });
                if (options.enableSwipe) {
                    that.events.bind('start', proxy(that, '_swipestart'));
                    that.events.bind('move', proxy(that, '_swipemove'));
                } else {
                    that.events.bind('start', proxy(that, '_dragstart'));
                    that.events.bind('move', eventProxy('drag'));
                    that.events.bind('end', eventProxy('dragend'));
                }
                quilt.notify(that);
            },
            events: [
                'touchstart',
                'dragstart',
                'drag',
                'dragend',
                'tap',
                'doubletap',
                'hold',
                'swipe',
                'gesturestart',
                'gesturechange',
                'gestureend'
            ],
            options: {
                name: 'Touch',
                surface: null,
                global: false,
                fastTap: false,
                filter: null,
                multiTouch: false,
                enableSwipe: false,
                minXDelta: 30,
                maxYDelta: 20,
                maxDuration: 1000,
                minHold: 800,
                doubleTapTimeout: 800
            },
            cancel: function () {
                this.events.cancel();
            },
            destroy: function () {
                Widget.fn.destroy.call(this);
                this.events.destroy();
            },
            _triggerTouch: function (type, e) {
                if (this.trigger(type, {
                        touch: e.touch,
                        event: e.event
                    })) {
                    e.preventDefault();
                }
            },
            _tap: function (e) {
                var that = this, lastTap = that.lastTap, touch = e.touch;
                if (lastTap && touch.endTime - lastTap.endTime < that.options.doubleTapTimeout && quilt.touchDelta(touch, lastTap).distance < MAX_DOUBLE_TAP_DISTANCE) {
                    that._triggerTouch('doubletap', e);
                    that.lastTap = null;
                } else {
                    that._triggerTouch('tap', e);
                    that.lastTap = touch;
                }
            },
            _dragstart: function (e) {
                this._triggerTouch('dragstart', e);
            },
            _swipestart: function (e) {
                if (abs(e.x.velocity) * 2 >= abs(e.y.velocity)) {
                    e.sender.capture();
                }
            },
            _swipemove: function (e) {
                var that = this, options = that.options, touch = e.touch, duration = e.event.timeStamp - touch.startTime, direction = touch.x.initialDelta > 0 ? 'right' : 'left';
                if (abs(touch.x.initialDelta) >= options.minXDelta && abs(touch.y.initialDelta) < options.maxYDelta && duration < options.maxDuration) {
                    that.trigger('swipe', {
                        direction: direction,
                        touch: e.touch
                    });
                    touch.cancel();
                }
            }
        });
        quilt.ui.plugin(Touch);
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.view', [
        'quilt.core',
        'quilt.binder',
        'quilt.fx'
    ], f);
}(function () {
    var __meta__ = {
        id: 'view',
        name: 'View',
        category: 'framework',
        description: 'The View class instantiates and handles the events of a certain screen from the application.',
        depends: [
            'core',
            'binder',
            'fx'
        ],
        hidden: false
    };
    (function ($, undefined) {
        var quilt = window.quilt, attr = quilt.attr, ui = quilt.ui, attrValue = quilt.attrValue, directiveSelector = quilt.directiveSelector, Observable = quilt.Observable, Widget = quilt.ui.Widget, roleSelector = quilt.roleSelector, SCRIPT = 'SCRIPT', INIT = 'init', TRANSITION_START = 'transitionStart', TRANSITION_END = 'transitionEnd', SHOW = 'show', HIDE = 'hide', ATTACH = 'attach', DETACH = 'detach', sizzleErrorRegExp = /unrecognized expression/;
        var bodyRegExp = /<body[^>]*>(([\u000a\u000d\u2028\u2029]|.)*)<\/body>/i;
        var LOAD_START = 'loadStart';
        var LOAD_COMPLETE = 'loadComplete';
        var SHOW_START = 'showStart';
        var SAME_VIEW_REQUESTED = 'sameViewRequested';
        var VIEW_SHOW = 'viewShow';
        var VIEW_TYPE_DETERMINED = 'viewTypeDetermined';
        var AFTER = 'after';
        var classNames = {
            content: 'k-content',
            view: 'k-view',
            stretchedView: 'k-stretched-view',
            widget: 'k-widget',
            header: 'k-header',
            footer: 'k-footer'
        };
        var View = quilt.ui.Widget.extend({
            init: function (content, options) {
                var that = this;
                options = options || {};
                that.id = quilt.guid();
                Observable.fn.init.call(that);
                this.options = $.extend({}, this.options, options);
                that.content = content;
                if (that.options.renderOnInit) {
                    Widget.fn.init.call(that, that._createElement(), options);
                }
                if (that.options.wrapInSections) {
                    that._renderSections();
                }
                that.tagName = options.tagName || 'div';
                that.model = options.model;
                that._wrap = options.wrap !== false;
                this._evalTemplate = options.evalTemplate || false;
                that._fragments = {};
                that.bind([
                    INIT,
                    SHOW,
                    HIDE,
                    TRANSITION_START,
                    TRANSITION_END
                ], options);
            },
            options: {
                name: 'View',
                renderOnInit: false,
                wrapInSections: false,
                detachOnHide: true,
                detachOnDestroy: true
            },
            render: function (container) {
                var that = this, notInitialized = !that.element;
                if (notInitialized) {
                    that.element = that._createElement();
                }
                if (container) {
                    $(container).append(that.element);
                }
                if (notInitialized) {
                    quilt.bind(that.element, that.model);
                    that.trigger(INIT);
                }
                if (container) {
                    that._eachFragment(ATTACH);
                    that.trigger(SHOW);
                }
                return that.element;
            },
            clone: function () {
                return new ViewClone(this);
            },
            triggerBeforeShow: function () {
                return true;
            },
            triggerBeforeHide: function () {
                return true;
            },
            showStart: function () {
                var that = this;
                var element = that.render();
                if (element) {
                    element.css('display', '');
                }
                this.trigger(SHOW_START, { view: this });
            },
            showEnd: function () {
            },
            hideEnd: function () {
                this.hide();
            },
            beforeTransition: function (type) {
                this.trigger(TRANSITION_START, { type: type });
            },
            afterTransition: function (type) {
                this.trigger(TRANSITION_END, { type: type });
            },
            hide: function () {
                if (this.options.detachOnHide) {
                    this._eachFragment(DETACH);
                    $(this.element).detach();
                }
                this.trigger(HIDE);
            },
            destroy: function () {
                var that = this;
                var element = that.element;
                if (element) {
                    Widget.fn.destroy.call(that);
                    quilt.unbind(element);
                    quilt.destroy(element);
                    if (that.options.detachOnDestroy) {
                        element.remove();
                    }
                }
            },
            purge: function () {
                var that = this;
                that.destroy();
                $(that.element).add(that.content).add(that.wrapper).off().remove();
            },
            fragments: function (fragments) {
                $.extend(this._fragments, fragments);
            },
            _eachFragment: function (methodName) {
                for (var placeholder in this._fragments) {
                    this._fragments[placeholder][methodName](this, placeholder);
                }
            },
            _createElement: function () {
                var that = this, wrapper = '<' + that.tagName + '>', element, content;
                try {
                    content = $(document.getElementById(that.content) || that.content);
                    if (content[0].tagName === SCRIPT) {
                        content = content.html();
                    }
                } catch (e) {
                    if (sizzleErrorRegExp.test(e.message)) {
                        content = that.content;
                    }
                }
                if (typeof content === 'string') {
                    content = content.replace(/^\s+|\s+$/g, '');
                    if (that._evalTemplate) {
                        content = quilt.template(content)(that.model || {});
                    }
                    element = $(wrapper).append(content);
                    if (!that._wrap) {
                        element = element.contents();
                    }
                } else {
                    element = content;
                    if (that._evalTemplate) {
                        var result = $(quilt.template($('<div />').append(element.clone(true)).html())(that.model || {}));
                        if ($.contains(document, element[0])) {
                            element.replaceWith(result);
                        }
                        element = result;
                    }
                    if (that._wrap) {
                        element = element.wrapAll(wrapper).parent();
                    }
                }
                return element;
            },
            _renderSections: function () {
                var that = this;
                if (that.options.wrapInSections) {
                    that._wrapper();
                    that._createContent();
                    that._createHeader();
                    that._createFooter();
                }
            },
            _wrapper: function () {
                var that = this;
                var content = that.content;
                if (content.is(roleSelector('view'))) {
                    that.wrapper = that.content;
                } else {
                    that.wrapper = content.wrap('<div data-' + quilt.ns + 'stretch="true" data-' + quilt.ns + 'role="view" data-' + quilt.ns + 'init-widgets="false"></div>').parent();
                }
                var wrapper = that.wrapper;
                wrapper.attr('id', that.id);
                wrapper.addClass(classNames.view);
                wrapper.addClass(classNames.widget);
                wrapper.attr('role', 'view');
            },
            _createContent: function () {
                var that = this;
                var wrapper = $(that.wrapper);
                var contentSelector = roleSelector('content');
                if (!wrapper.children(contentSelector)[0]) {
                    var ccontentElements = wrapper.children().filter(function () {
                        var child = $(this);
                        if (!child.is(roleSelector('header')) && !child.is(roleSelector('footer'))) {
                            return child;
                        }
                    });
                    ccontentElements.wrap('<div ' + attr('role') + '="content"></div>');
                }
                this.contentElement = wrapper.children(roleSelector('content'));
                this.contentElement.addClass(classNames.stretchedView).addClass(classNames.content);
            },
            _createHeader: function () {
                var that = this;
                var wrapper = that.wrapper;
                this.header = wrapper.children(roleSelector('header')).addClass(classNames.header);
            },
            _createFooter: function () {
                var that = this;
                var wrapper = that.wrapper;
                this.footer = wrapper.children(roleSelector('footer')).addClass(classNames.footer);
            }
        });
        var ViewClone = quilt.Class.extend({
            init: function (view) {
                $.extend(this, {
                    element: view.element.clone(true),
                    transition: view.transition,
                    id: view.id
                });
                view.element.parent().append(this.element);
            },
            hideEnd: function () {
                this.element.remove();
            },
            beforeTransition: $.noop,
            afterTransition: $.noop
        });
        var Layout = View.extend({
            init: function (content, options) {
                View.fn.init.call(this, content, options);
                this.containers = {};
            },
            container: function (selector) {
                var container = this.containers[selector];
                if (!container) {
                    container = this._createContainer(selector);
                    this.containers[selector] = container;
                }
                return container;
            },
            showIn: function (selector, view, transition) {
                this.container(selector).show(view, transition);
            },
            _createContainer: function (selector) {
                var root = this.render(), element = root.find(selector), container;
                if (!element.length && root.is(selector)) {
                    if (root.is(selector)) {
                        element = root;
                    } else {
                        throw new Error('can\'t find a container with the specified ' + selector + ' selector');
                    }
                }
                container = new ViewContainer(element);
                container.bind('accepted', function (e) {
                    e.view.render(element);
                });
                return container;
            }
        });
        var Fragment = View.extend({
            attach: function (view, placeholder) {
                view.element.find(placeholder).replaceWith(this.render());
            },
            detach: function () {
            }
        });
        var transitionRegExp = /^(\w+)(:(\w+))?( (\w+))?$/;
        function parseTransition(transition) {
            if (!transition) {
                return {};
            }
            var matches = transition.match(transitionRegExp) || [];
            return {
                type: matches[1],
                direction: matches[3],
                reverse: matches[5] === 'reverse'
            };
        }
        var ViewContainer = Observable.extend({
            init: function (container) {
                Observable.fn.init.call(this);
                this.container = container;
                this.history = [];
                this.view = null;
                this.running = false;
            },
            after: function () {
                this.running = false;
                this.trigger('complete', { view: this.view });
                this.trigger('after');
            },
            end: function () {
                this.view.showEnd();
                this.previous.hideEnd();
                this.after();
            },
            show: function (view, transition, locationID) {
                if (!view.triggerBeforeShow() || this.view && !this.view.triggerBeforeHide()) {
                    this.trigger('after');
                    return false;
                }
                locationID = locationID || view.id;
                var that = this, current = view === that.view ? view.clone() : that.view, history = that.history, previousEntry = history[history.length - 2] || {}, back = previousEntry.id === locationID, theTransition = transition || (back ? history[history.length - 1].transition : view.transition), transitionData = parseTransition(theTransition);
                if (that.running) {
                    that.effect.stop();
                }
                if (theTransition === 'none') {
                    theTransition = null;
                }
                that.trigger('accepted', { view: view });
                that.view = view;
                that.previous = current;
                that.running = true;
                if (!back) {
                    history.push({
                        id: locationID,
                        transition: theTransition
                    });
                } else {
                    history.pop();
                }
                if (!current) {
                    view.showStart();
                    view.showEnd();
                    that.after();
                    return true;
                }
                if (!theTransition || !quilt.effects.enabled) {
                    view.showStart();
                    that.end();
                } else {
                    view.element.addClass('k-fx-hidden');
                    view.showStart();
                    if (back && !transition) {
                        transitionData.reverse = !transitionData.reverse;
                    }
                    that.effect = quilt.fx(view.element).replace(current.element, transitionData.type).beforeTransition(function () {
                        view.beforeTransition('show');
                        current.beforeTransition('hide');
                    }).afterTransition(function () {
                        view.afterTransition('show');
                        current.afterTransition('hide');
                    }).direction(transitionData.direction).setReverse(transitionData.reverse);
                    that.effect.run().then(function () {
                        that.end();
                    });
                }
                return true;
            },
            destroy: function () {
                var that = this;
                var view = that.view;
                if (view && view.destroy) {
                    view.destroy();
                }
            }
        });
        var ViewEngine = Observable.extend({
            init: function (options) {
                var that = this, views, container;
                Observable.fn.init.call(that);
                that.options = options;
                $.extend(that, options);
                that.sandbox = $('<div />');
                container = that.container;
                views = that._hideViews(container);
                that.rootView = views.first();
                that.layouts = {};
                that.viewContainer = new quilt.ViewContainer(that.container);
                that.viewContainer.bind('accepted', function (e) {
                    e.view.params = that.params;
                });
                that.viewContainer.bind('complete', function (e) {
                    that.trigger(VIEW_SHOW, { view: e.view });
                });
                that.viewContainer.bind(AFTER, function () {
                    that.trigger(AFTER);
                });
                this.bind(this.events, options);
            },
            events: [
                SHOW_START,
                AFTER,
                VIEW_SHOW,
                LOAD_START,
                LOAD_COMPLETE,
                SAME_VIEW_REQUESTED,
                VIEW_TYPE_DETERMINED
            ],
            destroy: function () {
                var that = this;
                var viewContainer = that.viewContainer;
                quilt.destroy(that.container);
                for (var id in that.layouts) {
                    this.layouts[id].destroy();
                }
                if (viewContainer) {
                    viewContainer.destroy();
                }
            },
            view: function () {
                return this.viewContainer.view;
            },
            showView: function (url, transition, params) {
                url = url.replace(new RegExp('^' + this.remoteViewURLPrefix), '');
                if (url === '' && this.remoteViewURLPrefix) {
                    url = '/';
                }
                if (url.replace(/^#/, '') === this.url) {
                    this.trigger(SAME_VIEW_REQUESTED);
                    return false;
                }
                this.trigger(SHOW_START);
                var that = this, element = that._findViewElement(url), view = quilt.widgetInstance(element);
                that.url = url.replace(/^#/, '');
                that.params = params;
                if (view && view.reload) {
                    view.purge();
                    element = [];
                }
                this.trigger(VIEW_TYPE_DETERMINED, {
                    remote: element.length === 0,
                    url: url
                });
                if (element[0]) {
                    if (!view) {
                        view = that._createView(element);
                    }
                    return that.viewContainer.show(view, transition, url);
                } else {
                    return true;
                }
            },
            append: function (html, url) {
                var sandbox = this.sandbox, urlPath = (url || '').split('?')[0], container = this.container, views, view;
                if (bodyRegExp.test(html)) {
                    html = RegExp.$1;
                }
                sandbox[0].innerHTML = html;
                container.append(sandbox.children('script, style'));
                views = this._hideViews(sandbox);
                view = views.first();
                if (!view.length) {
                    views = view = sandbox.wrapInner('<div data-role=view />').children();
                }
                if (urlPath) {
                    view.hide().attr(attr('url'), urlPath);
                }
                container.append(views);
                return this._createView(view);
            },
            _locate: function (selectors) {
                return this.$angular ? directiveSelector(selectors) : roleSelector(selectors);
            },
            _findViewElement: function (url) {
                var element, urlPath = url.split('?')[0];
                if (!urlPath) {
                    return this.rootView;
                }
                element = this.container.children('[' + attr('url') + '=\'' + urlPath + '\']');
                if (!element[0] && urlPath.indexOf('/') === -1) {
                    element = this.container.children(urlPath.charAt(0) === '#' ? urlPath : '#' + urlPath);
                }
                if (!element[0]) {
                    element = this._findViewElementById(url);
                }
                return element;
            },
            _findViewElementById: function (id) {
                var element = this.container.children('[id=\'' + id + '\']');
                return element;
            },
            _createView: function (element) {
                return this._createSpaView(element);
            },
            _createMobileView: function (element) {
                return quilt.initWidget(element, {
                    defaultTransition: this.transition,
                    loader: this.loader,
                    container: this.container,
                    getLayout: this.getLayoutProxy,
                    modelScope: this.modelScope,
                    reload: attrValue(element, 'reload')
                }, ui.roles);
            },
            _createSpaView: function (element) {
                var viewOptions = (this.options || {}).viewOptions || {};
                return new quilt.View(element, {
                    renderOnInit: viewOptions.renderOnInit,
                    wrap: viewOptions.wrap || false,
                    wrapInSections: viewOptions.wrapInSections,
                    detachOnHide: viewOptions.detachOnHide,
                    detachOnDestroy: viewOptions.detachOnDestroy
                });
            },
            _hideViews: function (container) {
                return container.children(this._locate('view')).hide();
            }
        });
        quilt.ViewEngine = ViewEngine;
        quilt.ViewContainer = ViewContainer;
        quilt.Fragment = Fragment;
        quilt.Layout = Layout;
        quilt.View = View;
        quilt.ViewClone = ViewClone;
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.fx', ['quilt.core'], f);
}(function () {
    var __meta__ = {
        id: 'fx',
        name: 'Effects',
        category: 'framework',
        description: 'Required for animation effects in all Quilt widgets.',
        depends: ['core']
    };
    (function ($, undefined) {
        var quilt = window.quilt, fx = quilt.effects, each = $.each, extend = $.extend, proxy = $.proxy, support = quilt.support, browser = support.browser, transforms = support.transforms, transitions = support.transitions, scaleProperties = {
                scale: 0,
                scalex: 0,
                scaley: 0,
                scale3d: 0
            }, translateProperties = {
                translate: 0,
                translatex: 0,
                translatey: 0,
                translate3d: 0
            }, hasZoom = typeof document.documentElement.style.zoom !== 'undefined' && !transforms, matrix3dRegExp = /matrix3?d?\s*\(.*,\s*([\d\.\-]+)\w*?,\s*([\d\.\-]+)\w*?,\s*([\d\.\-]+)\w*?,\s*([\d\.\-]+)\w*?/i, cssParamsRegExp = /^(-?[\d\.\-]+)?[\w\s]*,?\s*(-?[\d\.\-]+)?[\w\s]*/i, translateXRegExp = /translatex?$/i, oldEffectsRegExp = /(zoom|fade|expand)(\w+)/, singleEffectRegExp = /(zoom|fade|expand)/, unitRegExp = /[xy]$/i, transformProps = [
                'perspective',
                'rotate',
                'rotatex',
                'rotatey',
                'rotatez',
                'rotate3d',
                'scale',
                'scalex',
                'scaley',
                'scalez',
                'scale3d',
                'skew',
                'skewx',
                'skewy',
                'translate',
                'translatex',
                'translatey',
                'translatez',
                'translate3d',
                'matrix',
                'matrix3d'
            ], transform2d = [
                'rotate',
                'scale',
                'scalex',
                'scaley',
                'skew',
                'skewx',
                'skewy',
                'translate',
                'translatex',
                'translatey',
                'matrix'
            ], transform2units = {
                'rotate': 'deg',
                scale: '',
                skew: 'px',
                translate: 'px'
            }, cssPrefix = transforms.css, round = Math.round, BLANK = '', PX = 'px', NONE = 'none', AUTO = 'auto', WIDTH = 'width', HEIGHT = 'height', HIDDEN = 'hidden', ORIGIN = 'origin', ABORT_ID = 'abortId', OVERFLOW = 'overflow', TRANSLATE = 'translate', POSITION = 'position', COMPLETE_CALLBACK = 'completeCallback', TRANSITION = cssPrefix + 'transition', TRANSFORM = cssPrefix + 'transform', BACKFACE = cssPrefix + 'backface-visibility', PERSPECTIVE = cssPrefix + 'perspective', DEFAULT_PERSPECTIVE = '1500px', TRANSFORM_PERSPECTIVE = 'perspective(' + DEFAULT_PERSPECTIVE + ')', directions = {
                left: {
                    reverse: 'right',
                    property: 'left',
                    transition: 'translatex',
                    vertical: false,
                    modifier: -1
                },
                right: {
                    reverse: 'left',
                    property: 'left',
                    transition: 'translatex',
                    vertical: false,
                    modifier: 1
                },
                down: {
                    reverse: 'up',
                    property: 'top',
                    transition: 'translatey',
                    vertical: true,
                    modifier: 1
                },
                up: {
                    reverse: 'down',
                    property: 'top',
                    transition: 'translatey',
                    vertical: true,
                    modifier: -1
                },
                top: { reverse: 'bottom' },
                bottom: { reverse: 'top' },
                'in': {
                    reverse: 'out',
                    modifier: -1
                },
                out: {
                    reverse: 'in',
                    modifier: 1
                },
                vertical: { reverse: 'vertical' },
                horizontal: { reverse: 'horizontal' }
            };
        quilt.directions = directions;
        extend($.fn, {
            quiltStop: function (clearQueue, gotoEnd) {
                if (transitions) {
                    return fx.stopQueue(this, clearQueue || false, gotoEnd || false);
                } else {
                    return this.stop(clearQueue, gotoEnd);
                }
            }
        });
        if (transforms && !transitions) {
            each(transform2d, function (idx, value) {
                $.fn[value] = function (val) {
                    if (typeof val == 'undefined') {
                        return animationProperty(this, value);
                    } else {
                        var that = $(this)[0], transformValue = value + '(' + val + transform2units[value.replace(unitRegExp, '')] + ')';
                        if (that.style.cssText.indexOf(TRANSFORM) == -1) {
                            $(this).css(TRANSFORM, transformValue);
                        } else {
                            that.style.cssText = that.style.cssText.replace(new RegExp(value + '\\(.*?\\)', 'i'), transformValue);
                        }
                    }
                    return this;
                };
                $.fx.step[value] = function (fx) {
                    $(fx.elem)[value](fx.now);
                };
            });
            var curProxy = $.fx.prototype.cur;
            $.fx.prototype.cur = function () {
                if (transform2d.indexOf(this.prop) != -1) {
                    return parseFloat($(this.elem)[this.prop]());
                }
                return curProxy.apply(this, arguments);
            };
        }
        quilt.toggleClass = function (element, classes, options, add) {
            if (classes) {
                classes = classes.split(' ');
                if (transitions) {
                    options = extend({
                        exclusive: 'all',
                        duration: 400,
                        ease: 'ease-out'
                    }, options);
                    element.css(TRANSITION, options.exclusive + ' ' + options.duration + 'ms ' + options.ease);
                    setTimeout(function () {
                        element.css(TRANSITION, '').css(HEIGHT);
                    }, options.duration);
                }
                each(classes, function (idx, value) {
                    element.toggleClass(value, add);
                });
            }
            return element;
        };
        quilt.parseEffects = function (input, mirror) {
            var effects = {};
            if (typeof input === 'string') {
                each(input.split(' '), function (idx, value) {
                    var redirectedEffect = !singleEffectRegExp.test(value), resolved = value.replace(oldEffectsRegExp, function (match, $1, $2) {
                            return $1 + ':' + $2.toLowerCase();
                        }), effect = resolved.split(':'), direction = effect[1], effectBody = {};
                    if (effect.length > 1) {
                        effectBody.direction = mirror && redirectedEffect ? directions[direction].reverse : direction;
                    }
                    effects[effect[0]] = effectBody;
                });
            } else {
                each(input, function (idx) {
                    var direction = this.direction;
                    if (direction && mirror && !singleEffectRegExp.test(idx)) {
                        this.direction = directions[direction].reverse;
                    }
                    effects[idx] = this;
                });
            }
            return effects;
        };
        function parseInteger(value) {
            return parseInt(value, 10);
        }
        function parseCSS(element, property) {
            return parseInteger(element.css(property));
        }
        function keys(obj) {
            var acc = [];
            for (var propertyName in obj) {
                acc.push(propertyName);
            }
            return acc;
        }
        function strip3DTransforms(properties) {
            for (var key in properties) {
                if (transformProps.indexOf(key) != -1 && transform2d.indexOf(key) == -1) {
                    delete properties[key];
                }
            }
            return properties;
        }
        function normalizeCSS(element, properties) {
            var transformation = [], cssValues = {}, lowerKey, key, value, isTransformed;
            for (key in properties) {
                lowerKey = key.toLowerCase();
                isTransformed = transforms && transformProps.indexOf(lowerKey) != -1;
                if (!support.hasHW3D && isTransformed && transform2d.indexOf(lowerKey) == -1) {
                    delete properties[key];
                } else {
                    value = properties[key];
                    if (isTransformed) {
                        transformation.push(key + '(' + value + ')');
                    } else {
                        cssValues[key] = value;
                    }
                }
            }
            if (transformation.length) {
                cssValues[TRANSFORM] = transformation.join(' ');
            }
            return cssValues;
        }
        if (transitions) {
            extend(fx, {
                transition: function (element, properties, options) {
                    var css, delay = 0, oldKeys = element.data('keys') || [], timeoutID;
                    options = extend({
                        duration: 200,
                        ease: 'ease-out',
                        complete: null,
                        exclusive: 'all'
                    }, options);
                    var stopTransitionCalled = false;
                    var stopTransition = function () {
                        if (!stopTransitionCalled) {
                            stopTransitionCalled = true;
                            if (timeoutID) {
                                clearTimeout(timeoutID);
                                timeoutID = null;
                            }
                            element.removeData(ABORT_ID).dequeue().css(TRANSITION, '').css(TRANSITION);
                            options.complete.call(element);
                        }
                    };
                    options.duration = $.fx ? $.fx.speeds[options.duration] || options.duration : options.duration;
                    css = normalizeCSS(element, properties);
                    $.merge(oldKeys, keys(css));
                    if ($.hasOwnProperty('uniqueSort')) {
                        element.data('keys', $.uniqueSort(oldKeys)).height();
                    } else {
                        element.data('keys', $.unique(oldKeys)).height();
                    }
                    element.css(TRANSITION, options.exclusive + ' ' + options.duration + 'ms ' + options.ease).css(TRANSITION);
                    element.css(css).css(TRANSFORM);
                    if (transitions.event) {
                        element.one(transitions.event, stopTransition);
                        if (options.duration !== 0) {
                            delay = 500;
                        }
                    }
                    timeoutID = setTimeout(stopTransition, options.duration + delay);
                    element.data(ABORT_ID, timeoutID);
                    element.data(COMPLETE_CALLBACK, stopTransition);
                },
                stopQueue: function (element, clearQueue, gotoEnd) {
                    var cssValues, taskKeys = element.data('keys'), retainPosition = !gotoEnd && taskKeys, completeCallback = element.data(COMPLETE_CALLBACK);
                    if (retainPosition) {
                        cssValues = quilt.getComputedStyles(element[0], taskKeys);
                    }
                    if (completeCallback) {
                        completeCallback();
                    }
                    if (retainPosition) {
                        element.css(cssValues);
                    }
                    return element.removeData('keys').stop(clearQueue);
                }
            });
        }
        function animationProperty(element, property) {
            if (transforms) {
                var transform = element.css(TRANSFORM);
                if (transform == NONE) {
                    return property == 'scale' ? 1 : 0;
                }
                var match = transform.match(new RegExp(property + '\\s*\\(([\\d\\w\\.]+)')), computed = 0;
                if (match) {
                    computed = parseInteger(match[1]);
                } else {
                    match = transform.match(matrix3dRegExp) || [
                        0,
                        0,
                        0,
                        0,
                        0
                    ];
                    property = property.toLowerCase();
                    if (translateXRegExp.test(property)) {
                        computed = parseFloat(match[3] / match[2]);
                    } else if (property == 'translatey') {
                        computed = parseFloat(match[4] / match[2]);
                    } else if (property == 'scale') {
                        computed = parseFloat(match[2]);
                    } else if (property == 'rotate') {
                        computed = parseFloat(Math.atan2(match[2], match[1]));
                    }
                }
                return computed;
            } else {
                return parseFloat(element.css(property));
            }
        }
        var EffectSet = quilt.Class.extend({
            init: function (element, options) {
                var that = this;
                that.element = element;
                that.effects = [];
                that.options = options;
                that.restore = [];
            },
            run: function (effects) {
                var that = this, effect, idx, jdx, length = effects.length, element = that.element, options = that.options, deferred = $.Deferred(), start = {}, end = {}, target, children, childrenLength;
                that.effects = effects;
                deferred.done($.proxy(that, 'complete'));
                element.data('animating', true);
                for (idx = 0; idx < length; idx++) {
                    effect = effects[idx];
                    effect.setReverse(options.reverse);
                    effect.setOptions(options);
                    that.addRestoreProperties(effect.restore);
                    effect.prepare(start, end);
                    children = effect.children();
                    for (jdx = 0, childrenLength = children.length; jdx < childrenLength; jdx++) {
                        children[jdx].duration(options.duration).run();
                    }
                }
                for (var effectName in options.effects) {
                    extend(end, options.effects[effectName].properties);
                }
                if (!element.is(':visible')) {
                    extend(start, { display: element.data('olddisplay') || 'block' });
                }
                if (transforms && !options.reset) {
                    target = element.data('targetTransform');
                    if (target) {
                        start = extend(target, start);
                    }
                }
                start = normalizeCSS(element, start);
                if (transforms && !transitions) {
                    start = strip3DTransforms(start);
                }
                element.css(start).css(TRANSFORM);
                for (idx = 0; idx < length; idx++) {
                    effects[idx].setup();
                }
                if (options.init) {
                    options.init();
                }
                element.data('targetTransform', end);
                fx.animate(element, end, extend({}, options, { complete: deferred.resolve }));
                return deferred.promise();
            },
            stop: function () {
                $(this.element).quiltStop(true, true);
            },
            addRestoreProperties: function (restore) {
                var element = this.element, value, i = 0, length = restore.length;
                for (; i < length; i++) {
                    value = restore[i];
                    this.restore.push(value);
                    if (!element.data(value)) {
                        element.data(value, element.css(value));
                    }
                }
            },
            restoreCallback: function () {
                var element = this.element;
                for (var i = 0, length = this.restore.length; i < length; i++) {
                    var value = this.restore[i];
                    element.css(value, element.data(value));
                }
            },
            complete: function () {
                var that = this, idx = 0, element = that.element, options = that.options, effects = that.effects, length = effects.length;
                element.removeData('animating').dequeue();
                if (options.hide) {
                    element.data('olddisplay', element.css('display')).hide();
                }
                this.restoreCallback();
                if (hasZoom && !transforms) {
                    setTimeout($.proxy(this, 'restoreCallback'), 0);
                }
                for (; idx < length; idx++) {
                    effects[idx].teardown();
                }
                if (options.completeCallback) {
                    options.completeCallback(element);
                }
            }
        });
        fx.promise = function (element, options) {
            var effects = [], effectClass, effectSet = new EffectSet(element, options), parsedEffects = quilt.parseEffects(options.effects), effect;
            options.effects = parsedEffects;
            for (var effectName in parsedEffects) {
                effectClass = fx[capitalize(effectName)];
                if (effectClass) {
                    effect = new effectClass(element, parsedEffects[effectName].direction);
                    effects.push(effect);
                }
            }
            if (effects[0]) {
                effectSet.run(effects);
            } else {
                if (!element.is(':visible')) {
                    element.css({ display: element.data('olddisplay') || 'block' }).css('display');
                }
                if (options.init) {
                    options.init();
                }
                element.dequeue();
                effectSet.complete();
            }
        };
        extend(fx, {
            animate: function (elements, properties, options) {
                var useTransition = options.transition !== false;
                delete options.transition;
                if (transitions && 'transition' in fx && useTransition) {
                    fx.transition(elements, properties, options);
                } else {
                    if (transforms) {
                        elements.animate(strip3DTransforms(properties), {
                            queue: false,
                            show: false,
                            hide: false,
                            duration: options.duration,
                            complete: options.complete
                        });
                    } else {
                        elements.each(function () {
                            var element = $(this), multiple = {};
                            each(transformProps, function (idx, value) {
                                var params, currentValue = properties ? properties[value] + ' ' : null;
                                if (currentValue) {
                                    var single = properties;
                                    if (value in scaleProperties && properties[value] !== undefined) {
                                        params = currentValue.match(cssParamsRegExp);
                                        if (transforms) {
                                            extend(single, { scale: +params[0] });
                                        }
                                    } else {
                                        if (value in translateProperties && properties[value] !== undefined) {
                                            var position = element.css(POSITION), isFixed = position == 'absolute' || position == 'fixed';
                                            if (!element.data(TRANSLATE)) {
                                                if (isFixed) {
                                                    element.data(TRANSLATE, {
                                                        top: parseCSS(element, 'top') || 0,
                                                        left: parseCSS(element, 'left') || 0,
                                                        bottom: parseCSS(element, 'bottom'),
                                                        right: parseCSS(element, 'right')
                                                    });
                                                } else {
                                                    element.data(TRANSLATE, {
                                                        top: parseCSS(element, 'marginTop') || 0,
                                                        left: parseCSS(element, 'marginLeft') || 0
                                                    });
                                                }
                                            }
                                            var originalPosition = element.data(TRANSLATE);
                                            params = currentValue.match(cssParamsRegExp);
                                            if (params) {
                                                var dX = value == TRANSLATE + 'y' ? +null : +params[1], dY = value == TRANSLATE + 'y' ? +params[1] : +params[2];
                                                if (isFixed) {
                                                    if (!isNaN(originalPosition.right)) {
                                                        if (!isNaN(dX)) {
                                                            extend(single, { right: originalPosition.right - dX });
                                                        }
                                                    } else {
                                                        if (!isNaN(dX)) {
                                                            extend(single, { left: originalPosition.left + dX });
                                                        }
                                                    }
                                                    if (!isNaN(originalPosition.bottom)) {
                                                        if (!isNaN(dY)) {
                                                            extend(single, { bottom: originalPosition.bottom - dY });
                                                        }
                                                    } else {
                                                        if (!isNaN(dY)) {
                                                            extend(single, { top: originalPosition.top + dY });
                                                        }
                                                    }
                                                } else {
                                                    if (!isNaN(dX)) {
                                                        extend(single, { marginLeft: originalPosition.left + dX });
                                                    }
                                                    if (!isNaN(dY)) {
                                                        extend(single, { marginTop: originalPosition.top + dY });
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (!transforms && value != 'scale' && value in single) {
                                        delete single[value];
                                    }
                                    if (single) {
                                        extend(multiple, single);
                                    }
                                }
                            });
                            if (browser.msie) {
                                delete multiple.scale;
                            }
                            element.animate(multiple, {
                                queue: false,
                                show: false,
                                hide: false,
                                duration: options.duration,
                                complete: options.complete
                            });
                        });
                    }
                }
            }
        });
        fx.animatedPromise = fx.promise;
        var Effect = quilt.Class.extend({
            init: function (element, direction) {
                var that = this;
                that.element = element;
                that._direction = direction;
                that.options = {};
                that._additionalEffects = [];
                if (!that.restore) {
                    that.restore = [];
                }
            },
            reverse: function () {
                this._reverse = true;
                return this.run();
            },
            play: function () {
                this._reverse = false;
                return this.run();
            },
            add: function (additional) {
                this._additionalEffects.push(additional);
                return this;
            },
            direction: function (value) {
                this._direction = value;
                return this;
            },
            duration: function (duration) {
                this._duration = duration;
                return this;
            },
            compositeRun: function () {
                var that = this, effectSet = new EffectSet(that.element, {
                        reverse: that._reverse,
                        duration: that._duration
                    }), effects = that._additionalEffects.concat([that]);
                return effectSet.run(effects);
            },
            run: function () {
                if (this._additionalEffects && this._additionalEffects[0]) {
                    return this.compositeRun();
                }
                var that = this, element = that.element, idx = 0, restore = that.restore, length = restore.length, value, deferred = $.Deferred(), start = {}, end = {}, target, children = that.children(), childrenLength = children.length;
                deferred.done($.proxy(that, '_complete'));
                element.data('animating', true);
                for (idx = 0; idx < length; idx++) {
                    value = restore[idx];
                    if (!element.data(value)) {
                        element.data(value, element.css(value));
                    }
                }
                for (idx = 0; idx < childrenLength; idx++) {
                    children[idx].duration(that._duration).run();
                }
                that.prepare(start, end);
                if (!element.is(':visible')) {
                    extend(start, { display: element.data('olddisplay') || 'block' });
                }
                if (transforms) {
                    target = element.data('targetTransform');
                    if (target) {
                        start = extend(target, start);
                    }
                }
                start = normalizeCSS(element, start);
                if (transforms && !transitions) {
                    start = strip3DTransforms(start);
                }
                element.css(start).css(TRANSFORM);
                that.setup();
                element.data('targetTransform', end);
                fx.animate(element, end, {
                    duration: that._duration,
                    complete: deferred.resolve
                });
                return deferred.promise();
            },
            stop: function () {
                var idx = 0, children = this.children(), childrenLength = children.length;
                for (idx = 0; idx < childrenLength; idx++) {
                    children[idx].stop();
                }
                $(this.element).quiltStop(true, true);
                return this;
            },
            restoreCallback: function () {
                var element = this.element;
                for (var i = 0, length = this.restore.length; i < length; i++) {
                    var value = this.restore[i];
                    element.css(value, element.data(value));
                }
            },
            _complete: function () {
                var that = this, element = that.element;
                element.removeData('animating').dequeue();
                that.restoreCallback();
                if (that.shouldHide()) {
                    element.data('olddisplay', element.css('display')).hide();
                }
                if (hasZoom && !transforms) {
                    setTimeout($.proxy(that, 'restoreCallback'), 0);
                }
                that.teardown();
            },
            setOptions: function (options) {
                extend(true, this.options, options);
            },
            children: function () {
                return [];
            },
            shouldHide: $.noop,
            setup: $.noop,
            prepare: $.noop,
            teardown: $.noop,
            directions: [],
            setReverse: function (reverse) {
                this._reverse = reverse;
                return this;
            }
        });
        function capitalize(word) {
            return word.charAt(0).toUpperCase() + word.substring(1);
        }
        function createEffect(name, definition) {
            var effectClass = Effect.extend(definition), directions = effectClass.prototype.directions;
            fx[capitalize(name)] = effectClass;
            fx.Element.prototype[name] = function (direction, opt1, opt2, opt3) {
                return new effectClass(this.element, direction, opt1, opt2, opt3);
            };
            each(directions, function (idx, theDirection) {
                fx.Element.prototype[name + capitalize(theDirection)] = function (opt1, opt2, opt3) {
                    return new effectClass(this.element, theDirection, opt1, opt2, opt3);
                };
            });
        }
        var FOUR_DIRECTIONS = [
                'left',
                'right',
                'up',
                'down'
            ], IN_OUT = [
                'in',
                'out'
            ];
        createEffect('slideIn', {
            directions: FOUR_DIRECTIONS,
            divisor: function (value) {
                this.options.divisor = value;
                return this;
            },
            prepare: function (start, end) {
                var that = this, tmp, element = that.element, outerWidth = quilt._outerWidth, outerHeight = quilt._outerHeight, direction = directions[that._direction], offset = -direction.modifier * (direction.vertical ? outerHeight(element) : outerWidth(element)), startValue = offset / (that.options && that.options.divisor || 1) + PX, endValue = '0px';
                if (that._reverse) {
                    tmp = start;
                    start = end;
                    end = tmp;
                }
                if (transforms) {
                    start[direction.transition] = startValue;
                    end[direction.transition] = endValue;
                } else {
                    start[direction.property] = startValue;
                    end[direction.property] = endValue;
                }
            }
        });
        createEffect('tile', {
            directions: FOUR_DIRECTIONS,
            init: function (element, direction, previous) {
                Effect.prototype.init.call(this, element, direction);
                this.options = { previous: previous };
            },
            previousDivisor: function (value) {
                this.options.previousDivisor = value;
                return this;
            },
            children: function () {
                var that = this, reverse = that._reverse, previous = that.options.previous, divisor = that.options.previousDivisor || 1, dir = that._direction;
                var children = [quilt.fx(that.element).slideIn(dir).setReverse(reverse)];
                if (previous) {
                    children.push(quilt.fx(previous).slideIn(directions[dir].reverse).divisor(divisor).setReverse(!reverse));
                }
                return children;
            }
        });
        function createToggleEffect(name, property, defaultStart, defaultEnd) {
            createEffect(name, {
                directions: IN_OUT,
                startValue: function (value) {
                    this._startValue = value;
                    return this;
                },
                endValue: function (value) {
                    this._endValue = value;
                    return this;
                },
                shouldHide: function () {
                    return this._shouldHide;
                },
                prepare: function (start, end) {
                    var that = this, startValue, endValue, out = this._direction === 'out', startDataValue = that.element.data(property), startDataValueIsSet = !(isNaN(startDataValue) || startDataValue == defaultStart);
                    if (startDataValueIsSet) {
                        startValue = startDataValue;
                    } else if (typeof this._startValue !== 'undefined') {
                        startValue = this._startValue;
                    } else {
                        startValue = out ? defaultStart : defaultEnd;
                    }
                    if (typeof this._endValue !== 'undefined') {
                        endValue = this._endValue;
                    } else {
                        endValue = out ? defaultEnd : defaultStart;
                    }
                    if (this._reverse) {
                        start[property] = endValue;
                        end[property] = startValue;
                    } else {
                        start[property] = startValue;
                        end[property] = endValue;
                    }
                    that._shouldHide = end[property] === defaultEnd;
                }
            });
        }
        createToggleEffect('fade', 'opacity', 1, 0);
        createToggleEffect('zoom', 'scale', 1, 0.01);
        createEffect('slideMargin', {
            prepare: function (start, end) {
                var that = this, element = that.element, options = that.options, origin = element.data(ORIGIN), offset = options.offset, margin, reverse = that._reverse;
                if (!reverse && origin === null) {
                    element.data(ORIGIN, parseFloat(element.css('margin-' + options.axis)));
                }
                margin = element.data(ORIGIN) || 0;
                end['margin-' + options.axis] = !reverse ? margin + offset : margin;
            }
        });
        createEffect('slideTo', {
            prepare: function (start, end) {
                var that = this, element = that.element, options = that.options, offset = options.offset.split(','), reverse = that._reverse;
                if (transforms) {
                    end.translatex = !reverse ? offset[0] : 0;
                    end.translatey = !reverse ? offset[1] : 0;
                } else {
                    end.left = !reverse ? offset[0] : 0;
                    end.top = !reverse ? offset[1] : 0;
                }
                element.css('left');
            }
        });
        createEffect('expand', {
            directions: [
                'horizontal',
                'vertical'
            ],
            restore: [OVERFLOW],
            prepare: function (start, end) {
                var that = this, element = that.element, options = that.options, reverse = that._reverse, property = that._direction === 'vertical' ? HEIGHT : WIDTH, setLength = element[0].style[property], oldLength = element.data(property), length = parseFloat(oldLength || setLength), realLength = round(element.css(property, AUTO)[property]());
                start.overflow = HIDDEN;
                length = options && options.reset ? realLength || length : length || realLength;
                end[property] = (reverse ? 0 : length) + PX;
                start[property] = (reverse ? length : 0) + PX;
                if (oldLength === undefined) {
                    element.data(property, setLength);
                }
            },
            shouldHide: function () {
                return this._reverse;
            },
            teardown: function () {
                var that = this, element = that.element, property = that._direction === 'vertical' ? HEIGHT : WIDTH, length = element.data(property);
                if (length == AUTO || length === BLANK) {
                    setTimeout(function () {
                        element.css(property, AUTO).css(property);
                    }, 0);
                }
            }
        });
        var TRANSFER_START_STATE = {
            position: 'absolute',
            marginLeft: 0,
            marginTop: 0,
            scale: 1
        };
        createEffect('transfer', {
            init: function (element, target) {
                this.element = element;
                this.options = { target: target };
                this.restore = [];
            },
            setup: function () {
                this.element.appendTo(document.body);
            },
            prepare: function (start, end) {
                var that = this, element = that.element, outerBox = fx.box(element), innerBox = fx.box(that.options.target), currentScale = animationProperty(element, 'scale'), scale = fx.fillScale(innerBox, outerBox), transformOrigin = fx.transformOrigin(innerBox, outerBox);
                extend(start, TRANSFER_START_STATE);
                end.scale = 1;
                element.css(TRANSFORM, 'scale(1)').css(TRANSFORM);
                element.css(TRANSFORM, 'scale(' + currentScale + ')');
                start.top = outerBox.top;
                start.left = outerBox.left;
                start.transformOrigin = transformOrigin.x + PX + ' ' + transformOrigin.y + PX;
                if (that._reverse) {
                    start.scale = scale;
                } else {
                    end.scale = scale;
                }
            }
        });
        var CLIPS = {
            top: 'rect(auto auto $size auto)',
            bottom: 'rect($size auto auto auto)',
            left: 'rect(auto $size auto auto)',
            right: 'rect(auto auto auto $size)'
        };
        var ROTATIONS = {
            top: {
                start: 'rotatex(0deg)',
                end: 'rotatex(180deg)'
            },
            bottom: {
                start: 'rotatex(-180deg)',
                end: 'rotatex(0deg)'
            },
            left: {
                start: 'rotatey(0deg)',
                end: 'rotatey(-180deg)'
            },
            right: {
                start: 'rotatey(180deg)',
                end: 'rotatey(0deg)'
            }
        };
        function clipInHalf(container, direction) {
            var vertical = quilt.directions[direction].vertical, size = container[vertical ? HEIGHT : WIDTH]() / 2 + 'px';
            return CLIPS[direction].replace('$size', size);
        }
        createEffect('turningPage', {
            directions: FOUR_DIRECTIONS,
            init: function (element, direction, container) {
                Effect.prototype.init.call(this, element, direction);
                this._container = container;
            },
            prepare: function (start, end) {
                var that = this, reverse = that._reverse, direction = reverse ? directions[that._direction].reverse : that._direction, rotation = ROTATIONS[direction];
                start.zIndex = 1;
                if (that._clipInHalf) {
                    start.clip = clipInHalf(that._container, quilt.directions[direction].reverse);
                }
                start[BACKFACE] = HIDDEN;
                end[TRANSFORM] = TRANSFORM_PERSPECTIVE + (reverse ? rotation.start : rotation.end);
                start[TRANSFORM] = TRANSFORM_PERSPECTIVE + (reverse ? rotation.end : rotation.start);
            },
            setup: function () {
                this._container.append(this.element);
            },
            face: function (value) {
                this._face = value;
                return this;
            },
            shouldHide: function () {
                var that = this, reverse = that._reverse, face = that._face;
                return reverse && !face || !reverse && face;
            },
            clipInHalf: function (value) {
                this._clipInHalf = value;
                return this;
            },
            temporary: function () {
                this.element.addClass('temp-page');
                return this;
            }
        });
        createEffect('staticPage', {
            directions: FOUR_DIRECTIONS,
            init: function (element, direction, container) {
                Effect.prototype.init.call(this, element, direction);
                this._container = container;
            },
            restore: ['clip'],
            prepare: function (start, end) {
                var that = this, direction = that._reverse ? directions[that._direction].reverse : that._direction;
                start.clip = clipInHalf(that._container, direction);
                start.opacity = 0.999;
                end.opacity = 1;
            },
            shouldHide: function () {
                var that = this, reverse = that._reverse, face = that._face;
                return reverse && !face || !reverse && face;
            },
            face: function (value) {
                this._face = value;
                return this;
            }
        });
        createEffect('pageturn', {
            directions: [
                'horizontal',
                'vertical'
            ],
            init: function (element, direction, face, back) {
                Effect.prototype.init.call(this, element, direction);
                this.options = {};
                this.options.face = face;
                this.options.back = back;
            },
            children: function () {
                var that = this, options = that.options, direction = that._direction === 'horizontal' ? 'left' : 'top', reverseDirection = quilt.directions[direction].reverse, reverse = that._reverse, temp, faceClone = options.face.clone(true).removeAttr('id'), backClone = options.back.clone(true).removeAttr('id'), element = that.element;
                if (reverse) {
                    temp = direction;
                    direction = reverseDirection;
                    reverseDirection = temp;
                }
                return [
                    quilt.fx(options.face).staticPage(direction, element).face(true).setReverse(reverse),
                    quilt.fx(options.back).staticPage(reverseDirection, element).setReverse(reverse),
                    quilt.fx(faceClone).turningPage(direction, element).face(true).clipInHalf(true).temporary().setReverse(reverse),
                    quilt.fx(backClone).turningPage(reverseDirection, element).clipInHalf(true).temporary().setReverse(reverse)
                ];
            },
            prepare: function (start, end) {
                start[PERSPECTIVE] = DEFAULT_PERSPECTIVE;
                start.transformStyle = 'preserve-3d';
                start.opacity = 0.999;
                end.opacity = 1;
            },
            teardown: function () {
                this.element.find('.temp-page').remove();
            }
        });
        createEffect('flip', {
            directions: [
                'horizontal',
                'vertical'
            ],
            init: function (element, direction, face, back) {
                Effect.prototype.init.call(this, element, direction);
                this.options = {};
                this.options.face = face;
                this.options.back = back;
            },
            children: function () {
                var that = this, options = that.options, direction = that._direction === 'horizontal' ? 'left' : 'top', reverseDirection = quilt.directions[direction].reverse, reverse = that._reverse, temp, element = that.element;
                if (reverse) {
                    temp = direction;
                    direction = reverseDirection;
                    reverseDirection = temp;
                }
                return [
                    quilt.fx(options.face).turningPage(direction, element).face(true).setReverse(reverse),
                    quilt.fx(options.back).turningPage(reverseDirection, element).setReverse(reverse)
                ];
            },
            prepare: function (start) {
                start[PERSPECTIVE] = DEFAULT_PERSPECTIVE;
                start.transformStyle = 'preserve-3d';
            }
        });
        var RESTORE_OVERFLOW = !support.mobileOS.android;
        var IGNORE_TRANSITION_EVENT_SELECTOR = '.km-touch-scrollbar, .km-actionsheet-wrapper';
        createEffect('replace', {
            _before: $.noop,
            _after: $.noop,
            init: function (element, previous, transitionClass) {
                Effect.prototype.init.call(this, element);
                this._previous = $(previous);
                this._transitionClass = transitionClass;
            },
            duration: function () {
                throw new Error('The replace effect does not support duration setting; the effect duration may be customized through the transition class rule');
            },
            beforeTransition: function (callback) {
                this._before = callback;
                return this;
            },
            afterTransition: function (callback) {
                this._after = callback;
                return this;
            },
            _both: function () {
                return $().add(this._element).add(this._previous);
            },
            _containerClass: function () {
                var direction = this._direction, containerClass = 'k-fx k-fx-start k-fx-' + this._transitionClass;
                if (direction) {
                    containerClass += ' k-fx-' + direction;
                }
                if (this._reverse) {
                    containerClass += ' k-fx-reverse';
                }
                return containerClass;
            },
            complete: function (e) {
                if (!this.deferred || e && $(e.target).is(IGNORE_TRANSITION_EVENT_SELECTOR)) {
                    return;
                }
                var container = this.container;
                container.removeClass('k-fx-end').removeClass(this._containerClass()).off(transitions.event, this.completeProxy);
                this._previous.hide().removeClass('k-fx-current');
                this.element.removeClass('k-fx-next');
                if (RESTORE_OVERFLOW) {
                    container.css(OVERFLOW, '');
                }
                if (!this.isAbsolute) {
                    this._both().css(POSITION, '');
                }
                this.deferred.resolve();
                delete this.deferred;
            },
            run: function () {
                if (this._additionalEffects && this._additionalEffects[0]) {
                    return this.compositeRun();
                }
                var that = this, element = that.element, previous = that._previous, container = element.parents().filter(previous.parents()).first(), both = that._both(), deferred = $.Deferred(), originalPosition = element.css(POSITION), originalOverflow;
                if (!container.length) {
                    container = element.parent();
                }
                this.container = container;
                this.deferred = deferred;
                this.isAbsolute = originalPosition == 'absolute';
                if (!this.isAbsolute) {
                    both.css(POSITION, 'absolute');
                }
                if (RESTORE_OVERFLOW) {
                    originalOverflow = container.css(OVERFLOW);
                    container.css(OVERFLOW, 'hidden');
                }
                if (!transitions) {
                    this.complete();
                } else {
                    element.addClass('k-fx-hidden');
                    container.addClass(this._containerClass());
                    this.completeProxy = $.proxy(this, 'complete');
                    container.on(transitions.event, this.completeProxy);
                    quilt.animationFrame(function () {
                        element.removeClass('k-fx-hidden').addClass('k-fx-next');
                        previous.css('display', '').addClass('k-fx-current');
                        that._before(previous, element);
                        quilt.animationFrame(function () {
                            container.removeClass('k-fx-start').addClass('k-fx-end');
                            that._after(previous, element);
                        });
                    });
                }
                return deferred.promise();
            },
            stop: function () {
                this.complete();
            }
        });
        var Animation = quilt.Class.extend({
            init: function () {
                var that = this;
                that._tickProxy = proxy(that._tick, that);
                that._started = false;
            },
            tick: $.noop,
            done: $.noop,
            onEnd: $.noop,
            onCancel: $.noop,
            start: function () {
                if (!this.enabled()) {
                    return;
                }
                if (!this.done()) {
                    this._started = true;
                    quilt.animationFrame(this._tickProxy);
                } else {
                    this.onEnd();
                }
            },
            enabled: function () {
                return true;
            },
            cancel: function () {
                this._started = false;
                this.onCancel();
            },
            _tick: function () {
                var that = this;
                if (!that._started) {
                    return;
                }
                that.tick();
                if (!that.done()) {
                    quilt.animationFrame(that._tickProxy);
                } else {
                    that._started = false;
                    that.onEnd();
                }
            }
        });
        var Transition = Animation.extend({
            init: function (options) {
                var that = this;
                extend(that, options);
                Animation.fn.init.call(that);
            },
            done: function () {
                return this.timePassed() >= this.duration;
            },
            timePassed: function () {
                return Math.min(this.duration, new Date() - this.startDate);
            },
            moveTo: function (options) {
                var that = this, movable = that.movable;
                that.initial = movable[that.axis];
                that.delta = options.location - that.initial;
                that.duration = typeof options.duration == 'number' ? options.duration : 300;
                that.tick = that._easeProxy(options.ease);
                that.startDate = new Date();
                that.start();
            },
            _easeProxy: function (ease) {
                var that = this;
                return function () {
                    that.movable.moveAxis(that.axis, ease(that.timePassed(), that.initial, that.delta, that.duration));
                };
            }
        });
        extend(Transition, {
            easeOutExpo: function (t, b, c, d) {
                return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
            },
            easeOutBack: function (t, b, c, d, s) {
                s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            }
        });
        fx.Animation = Animation;
        fx.Transition = Transition;
        fx.createEffect = createEffect;
        fx.box = function (element) {
            element = $(element);
            var result = element.offset();
            result.width = quilt._outerWidth(element);
            result.height = quilt._outerHeight(element);
            return result;
        };
        fx.transformOrigin = function (inner, outer) {
            var x = (inner.left - outer.left) * outer.width / (outer.width - inner.width), y = (inner.top - outer.top) * outer.height / (outer.height - inner.height);
            return {
                x: isNaN(x) ? 0 : x,
                y: isNaN(y) ? 0 : y
            };
        };
        fx.fillScale = function (inner, outer) {
            return Math.min(inner.width / outer.width, inner.height / outer.height);
        };
        fx.fitScale = function (inner, outer) {
            return Math.max(inner.width / outer.width, inner.height / outer.height);
        };
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.dom', ['quilt.core'], f);
}(function () {
    var __meta__ = {
        id: 'dom',
        name: 'Virtual DOM',
        category: 'framework',
        depends: ['core'],
        advanced: true
    };
    (function (quilt) {
        function Node() {
            this.node = null;
        }
        Node.prototype = {
            remove: function () {
                if (this.node.parentNode) {
                    this.node.parentNode.removeChild(this.node);
                }
                this.attr = {};
            },
            attr: {},
            text: function () {
                return '';
            }
        };
        function NullNode() {
        }
        NullNode.prototype = {
            nodeName: '#null',
            attr: { style: {} },
            children: [],
            remove: function () {
            }
        };
        var NULL_NODE = new NullNode();
        function Element(nodeName, attr, children) {
            this.nodeName = nodeName;
            this.attr = attr || {};
            this.children = children || [];
        }
        Element.prototype = new Node();
        Element.prototype.appendTo = function (parent) {
            var node = document.createElement(this.nodeName);
            var children = this.children;
            for (var index = 0; index < children.length; index++) {
                children[index].render(node, NULL_NODE);
            }
            parent.appendChild(node);
            return node;
        };
        Element.prototype.render = function (parent, cached) {
            var node;
            if (cached.nodeName !== this.nodeName) {
                cached.remove();
                node = this.appendTo(parent);
            } else {
                node = cached.node;
                var index;
                var children = this.children;
                var length = children.length;
                var cachedChildren = cached.children;
                var cachedLength = cachedChildren.length;
                if (Math.abs(cachedLength - length) > 2) {
                    this.render({
                        appendChild: function (node) {
                            parent.replaceChild(node, cached.node);
                        }
                    }, NULL_NODE);
                    return;
                }
                for (index = 0; index < length; index++) {
                    children[index].render(node, cachedChildren[index] || NULL_NODE);
                }
                for (index = length; index < cachedLength; index++) {
                    cachedChildren[index].remove();
                }
            }
            this.node = node;
            this.syncAttributes(cached.attr);
            this.removeAttributes(cached.attr);
        };
        Element.prototype.syncAttributes = function (cachedAttr) {
            var attr = this.attr;
            for (var name in attr) {
                var value = attr[name];
                var cachedValue = cachedAttr[name];
                if (name === 'style') {
                    this.setStyle(value, cachedValue);
                } else if (value !== cachedValue) {
                    this.setAttribute(name, value, cachedValue);
                }
            }
        };
        Element.prototype.setStyle = function (style, cachedValue) {
            var node = this.node;
            var key;
            if (cachedValue) {
                for (key in style) {
                    if (style[key] !== cachedValue[key]) {
                        node.style[key] = style[key];
                    }
                }
            } else {
                for (key in style) {
                    node.style[key] = style[key];
                }
            }
        };
        Element.prototype.removeStyle = function (cachedStyle) {
            var style = this.attr.style || {};
            var node = this.node;
            for (var key in cachedStyle) {
                if (style[key] === undefined) {
                    node.style[key] = '';
                }
            }
        };
        Element.prototype.removeAttributes = function (cachedAttr) {
            var attr = this.attr;
            for (var name in cachedAttr) {
                if (name === 'style') {
                    this.removeStyle(cachedAttr.style);
                } else if (attr[name] === undefined) {
                    this.removeAttribute(name);
                }
            }
        };
        Element.prototype.removeAttribute = function (name) {
            var node = this.node;
            if (name === 'style') {
                node.style.cssText = '';
            } else if (name === 'className') {
                node.className = '';
            } else {
                node.removeAttribute(name);
            }
        };
        Element.prototype.setAttribute = function (name, value) {
            var node = this.node;
            if (node[name] !== undefined) {
                node[name] = value;
            } else {
                node.setAttribute(name, value);
            }
        };
        Element.prototype.text = function () {
            var str = '';
            for (var i = 0; i < this.children.length; ++i) {
                str += this.children[i].text();
            }
            return str;
        };
        function TextNode(nodeValue) {
            this.nodeValue = String(nodeValue);
        }
        TextNode.prototype = new Node();
        TextNode.prototype.nodeName = '#text';
        TextNode.prototype.render = function (parent, cached) {
            var node;
            if (cached.nodeName !== this.nodeName) {
                cached.remove();
                node = document.createTextNode(this.nodeValue);
                parent.appendChild(node);
            } else {
                node = cached.node;
                if (this.nodeValue !== cached.nodeValue) {
                    if (node.parentNode) {
                        node.nodeValue = this.nodeValue;
                    }
                }
            }
            this.node = node;
        };
        TextNode.prototype.text = function () {
            return this.nodeValue;
        };
        function HtmlNode(html) {
            this.html = html;
        }
        HtmlNode.prototype = {
            nodeName: '#html',
            attr: {},
            remove: function () {
                for (var index = 0; index < this.nodes.length; index++) {
                    var el = this.nodes[index];
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                }
            },
            render: function (parent, cached) {
                if (cached.nodeName !== this.nodeName || cached.html !== this.html) {
                    cached.remove();
                    var lastChild = parent.lastChild;
                    insertHtml(parent, this.html);
                    this.nodes = [];
                    for (var child = lastChild ? lastChild.nextSibling : parent.firstChild; child; child = child.nextSibling) {
                        this.nodes.push(child);
                    }
                } else {
                    this.nodes = cached.nodes.slice(0);
                }
            }
        };
        var HTML_CONTAINER = document.createElement('div');
        function insertHtml(node, html) {
            HTML_CONTAINER.innerHTML = html;
            while (HTML_CONTAINER.firstChild) {
                node.appendChild(HTML_CONTAINER.firstChild);
            }
        }
        function html(value) {
            return new HtmlNode(value);
        }
        function element(nodeName, attrs, children) {
            return new Element(nodeName, attrs, children);
        }
        function text(value) {
            return new TextNode(value);
        }
        function Tree(root) {
            this.root = root;
            this.children = [];
        }
        Tree.prototype = {
            html: html,
            element: element,
            text: text,
            render: function (children) {
                var cachedChildren = this.children;
                var index;
                var length;
                for (index = 0, length = children.length; index < length; index++) {
                    var cached = cachedChildren[index];
                    if (!cached) {
                        cached = NULL_NODE;
                    } else if (!cached.node || !cached.node.parentNode) {
                        cached.remove();
                        cached = NULL_NODE;
                    }
                    children[index].render(this.root, cached);
                }
                for (index = length; index < cachedChildren.length; index++) {
                    cachedChildren[index].remove();
                }
                this.children = children;
            }
        };
        quilt.dom = {
            html: html,
            text: text,
            element: element,
            Tree: Tree,
            Node: Node
        };
    }(window.quilt));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.data.odata', ['quilt.core'], f);
}(function () {
    var __meta__ = {
        id: 'data.odata',
        name: 'OData',
        category: 'framework',
        depends: ['core'],
        hidden: true
    };
    (function ($, undefined) {
        var quilt = window.quilt, extend = $.extend, NEWLINE = '\r\n', DOUBLELINE = '\r\n\r\n', isFunction = quilt.isFunction, odataFilters = {
                eq: 'eq',
                neq: 'ne',
                gt: 'gt',
                gte: 'ge',
                lt: 'lt',
                lte: 'le',
                contains: 'substringof',
                doesnotcontain: 'substringof',
                endswith: 'endswith',
                startswith: 'startswith',
                isnull: 'eq',
                isnotnull: 'ne',
                isnullorempty: 'eq',
                isnotnullorempty: 'ne',
                isempty: 'eq',
                isnotempty: 'ne'
            }, odataFiltersVersionFour = extend({}, odataFilters, { contains: 'contains' }), mappers = {
                pageSize: $.noop,
                page: $.noop,
                filter: function (params, filter, useVersionFour) {
                    if (filter) {
                        filter = toOdataFilter(filter, useVersionFour);
                        if (filter) {
                            params.$filter = filter;
                        }
                    }
                },
                sort: function (params, orderby) {
                    var expr = $.map(orderby, function (value) {
                        var order = value.field.replace(/\./g, '/');
                        if (value.dir === 'desc') {
                            order += ' desc';
                        }
                        return order;
                    }).join(',');
                    if (expr) {
                        params.$orderby = expr;
                    }
                },
                skip: function (params, skip) {
                    if (skip) {
                        params.$skip = skip;
                    }
                },
                take: function (params, take) {
                    if (take) {
                        params.$top = take;
                    }
                }
            }, defaultDataType = { read: { dataType: 'jsonp' } };
        function toOdataFilter(filter, useOdataFour) {
            var result = [], logic = filter.logic || 'and', idx, length, field, type, format, operator, value, ignoreCase, filters = filter.filters;
            for (idx = 0, length = filters.length; idx < length; idx++) {
                filter = filters[idx];
                field = filter.field;
                value = filter.value;
                operator = filter.operator;
                if (filter.filters) {
                    filter = toOdataFilter(filter, useOdataFour);
                } else {
                    ignoreCase = filter.ignoreCase;
                    field = field.replace(/\./g, '/');
                    filter = odataFilters[operator];
                    if (useOdataFour) {
                        filter = odataFiltersVersionFour[operator];
                    }
                    if (operator === 'isnullorempty') {
                        filter = quilt.format('{0} {1} null or {0} {1} \'\'', field, filter);
                    } else if (operator === 'isnotnullorempty') {
                        filter = quilt.format('{0} {1} null and {0} {1} \'\'', field, filter);
                    } else if (operator === 'isnull' || operator === 'isnotnull') {
                        filter = quilt.format('{0} {1} null', field, filter);
                    } else if (operator === 'isempty' || operator === 'isnotempty') {
                        filter = quilt.format('{0} {1} \'\'', field, filter);
                    } else if (filter && value !== undefined) {
                        type = $.type(value);
                        if (type === 'string') {
                            format = '\'{1}\'';
                            value = value.replace(/'/g, '\'\'');
                            if (ignoreCase === true) {
                                field = 'tolower(' + field + ')';
                            }
                        } else if (type === 'date') {
                            if (useOdataFour) {
                                format = '{1:yyyy-MM-ddTHH:mm:ss+00:00}';
                                value = quilt.timezone.apply(value, 'Etc/UTC');
                            } else {
                                format = 'datetime\'{1:yyyy-MM-ddTHH:mm:ss}\'';
                            }
                        } else {
                            format = '{1}';
                        }
                        if (filter.length > 3) {
                            if (filter !== 'substringof') {
                                format = '{0}({2},' + format + ')';
                            } else {
                                format = '{0}(' + format + ',{2})';
                                if (operator === 'doesnotcontain') {
                                    if (useOdataFour) {
                                        format = '{0}({2},\'{1}\') eq -1';
                                        filter = 'indexof';
                                    } else {
                                        format += ' eq false';
                                    }
                                }
                            }
                        } else {
                            format = '{2} {0} ' + format;
                        }
                        filter = quilt.format(format, filter, value, field);
                    }
                }
                result.push(filter);
            }
            filter = result.join(' ' + logic + ' ');
            if (result.length > 1) {
                filter = '(' + filter + ')';
            }
            return filter;
        }
        function stripMetadata(obj) {
            for (var name in obj) {
                if (name.indexOf('@odata') === 0) {
                    delete obj[name];
                }
            }
        }
        function hex16() {
            return Math.floor((1 + Math.random()) * 65536).toString(16).substr(1);
        }
        function createBoundary(prefix) {
            return prefix + hex16() + '-' + hex16() + '-' + hex16();
        }
        function createDelimeter(boundary, close) {
            var result = NEWLINE + '--' + boundary;
            if (close) {
                result += '--';
            }
            return result;
        }
        function createCommand(transport, item, httpVerb, command) {
            var transportUrl = transport.options[command].url;
            var commandPrefix = quilt.format('{0} ', httpVerb);
            if (isFunction(transportUrl)) {
                return commandPrefix + transportUrl(item);
            } else {
                return commandPrefix + transportUrl;
            }
        }
        function getOperationHeader(changeset, changeId) {
            var header = '';
            header += createDelimeter(changeset, false);
            header += NEWLINE + 'Content-Type: application/http';
            header += NEWLINE + 'Content-Transfer-Encoding: binary';
            header += NEWLINE + 'Content-ID: ' + changeId;
            return header;
        }
        function getOperationContent(item) {
            var content = '';
            content += NEWLINE + 'Content-Type: application/json;odata=minimalmetadata';
            content += NEWLINE + 'Prefer: return=representation';
            content += DOUBLELINE + quilt.stringify(item);
            return content;
        }
        function getOperations(collection, changeset, changeId, command, transport, skipContent) {
            var requestBody = '';
            for (var i = 0; i < collection.length; i++) {
                requestBody += getOperationHeader(changeset, changeId);
                requestBody += DOUBLELINE + createCommand(transport, collection[i], transport.options[command].type, command) + ' HTTP/1.1';
                if (!skipContent) {
                    requestBody += getOperationContent(collection[i]);
                }
                requestBody += NEWLINE;
                changeId++;
            }
            return requestBody;
        }
        function processCollection(colection, boundary, changeset, changeId, transport, command, skipContent) {
            var requestBody = '';
            requestBody += getBoundary(boundary, changeset);
            requestBody += getOperations(colection, changeset, changeId, command, transport, skipContent);
            requestBody += createDelimeter(changeset, true);
            requestBody += NEWLINE;
            return requestBody;
        }
        function getBoundary(boundary, changeset) {
            var requestBody = '';
            requestBody += '--' + boundary + NEWLINE;
            requestBody += 'Content-Type: multipart/mixed; boundary=' + changeset + NEWLINE;
            return requestBody;
        }
        function createBatchRequest(transport, colections) {
            var options = extend({}, transport.options.batch);
            var boundary = createBoundary('sf_batch_');
            var requestBody = '';
            var changeId = 0;
            var batchURL = transport.options.batch.url;
            var changeset = createBoundary('sf_changeset_');
            options.type = transport.options.batch.type;
            options.url = isFunction(batchURL) ? batchURL() : batchURL;
            options.headers = extend(options.headers || {}, { 'Content-Type': 'multipart/mixed; boundary=' + boundary });
            if (colections.updated.length) {
                requestBody += processCollection(colections.updated, boundary, changeset, changeId, transport, 'update', false);
                changeId += colections.updated.length;
                changeset = createBoundary('sf_changeset_');
            }
            if (colections.destroyed.length) {
                requestBody += processCollection(colections.destroyed, boundary, changeset, changeId, transport, 'destroy', true);
                changeId += colections.destroyed.length;
                changeset = createBoundary('sf_changeset_');
            }
            if (colections.created.length) {
                requestBody += processCollection(colections.created, boundary, changeset, changeId, transport, 'create', false);
            }
            requestBody += createDelimeter(boundary, true);
            options.data = requestBody;
            return options;
        }
        function parseBatchResponse(responseText) {
            var responseMarkers = responseText.match(/--changesetresponse_[a-z0-9-]+$/gm);
            var markerIndex = 0;
            var collections = [];
            var changeBody;
            var status;
            var code;
            var marker;
            var jsonModel;
            collections.push({
                models: [],
                passed: true
            });
            for (var i = 0; i < responseMarkers.length; i++) {
                marker = responseMarkers[i];
                if (marker.lastIndexOf('--', marker.length - 1)) {
                    if (i < responseMarkers.length - 1) {
                        collections.push({
                            models: [],
                            passed: true
                        });
                    }
                    continue;
                }
                if (!markerIndex) {
                    markerIndex = responseText.indexOf(marker);
                } else {
                    markerIndex = responseText.indexOf(marker, markerIndex + marker.length);
                }
                changeBody = responseText.substring(markerIndex, responseText.indexOf('--', markerIndex + 1));
                status = changeBody.match(/^HTTP\/1\.\d (\d{3}) (.*)$/gm).pop();
                code = quilt.parseFloat(status.match(/\d{3}/g).pop());
                if (code >= 200 && code <= 299) {
                    jsonModel = changeBody.match(/\{.*\}/gm);
                    if (jsonModel) {
                        collections[collections.length - 1].models.push(JSON.parse(jsonModel[0]));
                    }
                } else {
                    collections[collections.length - 1].passed = false;
                }
            }
            return collections;
        }
        extend(true, quilt.data, {
            schemas: {
                odata: {
                    type: 'json',
                    data: function (data) {
                        return data.d.results || [data.d];
                    },
                    total: 'd.__count'
                }
            },
            transports: {
                odata: {
                    read: {
                        cache: true,
                        dataType: 'jsonp',
                        jsonp: '$callback'
                    },
                    update: {
                        cache: true,
                        dataType: 'json',
                        contentType: 'application/json',
                        type: 'PUT'
                    },
                    create: {
                        cache: true,
                        dataType: 'json',
                        contentType: 'application/json',
                        type: 'POST'
                    },
                    destroy: {
                        cache: true,
                        dataType: 'json',
                        type: 'DELETE'
                    },
                    parameterMap: function (options, type, useVersionFour) {
                        var params, value, option, dataType;
                        options = options || {};
                        type = type || 'read';
                        dataType = (this.options || defaultDataType)[type];
                        dataType = dataType ? dataType.dataType : 'json';
                        if (type === 'read') {
                            params = { $inlinecount: 'allpages' };
                            if (dataType != 'json') {
                                params.$format = 'json';
                            }
                            for (option in options) {
                                if (mappers[option]) {
                                    mappers[option](params, options[option], useVersionFour);
                                } else {
                                    params[option] = options[option];
                                }
                            }
                        } else {
                            if (dataType !== 'json') {
                                throw new Error('Only json dataType can be used for ' + type + ' operation.');
                            }
                            if (type !== 'destroy') {
                                for (option in options) {
                                    value = options[option];
                                    if (typeof value === 'number') {
                                        options[option] = value + '';
                                    }
                                }
                                params = quilt.stringify(options);
                            }
                        }
                        return params;
                    }
                }
            }
        });
        extend(true, quilt.data, {
            schemas: {
                'odata-v4': {
                    type: 'json',
                    data: function (data) {
                        if ($.isArray(data)) {
                            for (var i = 0; i < data.length; i++) {
                                stripMetadata(data[i]);
                            }
                            return data;
                        } else {
                            data = $.extend({}, data);
                            stripMetadata(data);
                            if (data.value) {
                                return data.value;
                            }
                            return [data];
                        }
                    },
                    total: function (data) {
                        return data['@odata.count'];
                    }
                }
            },
            transports: {
                'odata-v4': {
                    batch: { type: 'POST' },
                    read: {
                        cache: true,
                        dataType: 'json'
                    },
                    update: {
                        cache: true,
                        dataType: 'json',
                        contentType: 'application/json;IEEE754Compatible=true',
                        type: 'PUT'
                    },
                    create: {
                        cache: true,
                        dataType: 'json',
                        contentType: 'application/json;IEEE754Compatible=true',
                        type: 'POST'
                    },
                    destroy: {
                        cache: true,
                        dataType: 'json',
                        type: 'DELETE'
                    },
                    parameterMap: function (options, type) {
                        var result = quilt.data.transports.odata.parameterMap(options, type, true);
                        if (type == 'read') {
                            result.$count = true;
                            delete result.$inlinecount;
                        }
                        if (result && result.$filter) {
                            result.$filter = result.$filter.replace(/('[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')/gi, function (x) {
                                return x.substring(1, x.length - 1);
                            });
                        }
                        return result;
                    },
                    submit: function (e) {
                        var that = this;
                        var options = createBatchRequest(that, e.data);
                        var collections = e.data;
                        if (!collections.updated.length && !collections.destroyed.length && !collections.created.length) {
                            return;
                        }
                        $.ajax(extend(true, {}, {
                            success: function (response) {
                                var responses = parseBatchResponse(response);
                                var index = 0;
                                var current;
                                if (collections.updated.length) {
                                    current = responses[index];
                                    if (current.passed) {
                                        e.success(current.models.length ? current.models : [], 'update');
                                    }
                                    index++;
                                }
                                if (collections.destroyed.length) {
                                    current = responses[index];
                                    if (current.passed) {
                                        e.success([], 'destroy');
                                    }
                                    index++;
                                }
                                if (collections.created.length) {
                                    current = responses[index];
                                    if (current.passed) {
                                        e.success(current.models, 'create');
                                    }
                                }
                            },
                            error: function (response, status, error) {
                                e.error(response, status, error);
                            }
                        }, options));
                    }
                }
            }
        });
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.data.xml', ['quilt.core'], f);
}(function () {
    var __meta__ = {
        id: 'data.xml',
        name: 'XML',
        category: 'framework',
        depends: ['core'],
        hidden: true
    };
    (function ($, undefined) {
        var quilt = window.quilt, isArray = $.isArray, isPlainObject = $.isPlainObject, map = $.map, each = $.each, extend = $.extend, getter = quilt.getter, Class = quilt.Class;
        var XmlDataReader = Class.extend({
            init: function (options) {
                var that = this, total = options.total, model = options.model, parse = options.parse, errors = options.errors, serialize = options.serialize, data = options.data;
                if (model) {
                    if (isPlainObject(model)) {
                        var base = options.modelBase || quilt.data.Model;
                        if (model.fields) {
                            each(model.fields, function (field, value) {
                                if (isPlainObject(value) && value.field) {
                                    if (!$.isFunction(value.field)) {
                                        value = extend(value, { field: that.getter(value.field) });
                                    }
                                } else {
                                    value = { field: that.getter(value) };
                                }
                                model.fields[field] = value;
                            });
                        }
                        var id = model.id;
                        if (id) {
                            var idField = {};
                            idField[that.xpathToMember(id, true)] = { field: that.getter(id) };
                            model.fields = extend(idField, model.fields);
                            model.id = that.xpathToMember(id);
                        }
                        model = base.define(model);
                    }
                    that.model = model;
                }
                if (total) {
                    if (typeof total == 'string') {
                        total = that.getter(total);
                        that.total = function (data) {
                            return parseInt(total(data), 10);
                        };
                    } else if (typeof total == 'function') {
                        that.total = total;
                    }
                }
                if (errors) {
                    if (typeof errors == 'string') {
                        errors = that.getter(errors);
                        that.errors = function (data) {
                            return errors(data) || null;
                        };
                    } else if (typeof errors == 'function') {
                        that.errors = errors;
                    }
                }
                if (data) {
                    if (typeof data == 'string') {
                        data = that.xpathToMember(data);
                        that.data = function (value) {
                            var result = that.evaluate(value, data), modelInstance;
                            result = isArray(result) ? result : [result];
                            if (that.model && model.fields) {
                                modelInstance = new that.model();
                                return map(result, function (value) {
                                    if (value) {
                                        var record = {}, field;
                                        for (field in model.fields) {
                                            record[field] = modelInstance._parse(field, model.fields[field].field(value));
                                        }
                                        return record;
                                    }
                                });
                            }
                            return result;
                        };
                    } else if (typeof data == 'function') {
                        that.data = data;
                    }
                }
                if (typeof parse == 'function') {
                    var xmlParse = that.parse;
                    that.parse = function (data) {
                        var xml = parse.call(that, data);
                        return xmlParse.call(that, xml);
                    };
                }
                if (typeof serialize == 'function') {
                    that.serialize = serialize;
                }
            },
            total: function (result) {
                return this.data(result).length;
            },
            errors: function (data) {
                return data ? data.errors : null;
            },
            serialize: function (data) {
                return data;
            },
            parseDOM: function (element) {
                var result = {}, parsedNode, node, nodeType, nodeName, member, attribute, attributes = element.attributes, attributeCount = attributes.length, idx;
                for (idx = 0; idx < attributeCount; idx++) {
                    attribute = attributes[idx];
                    result['@' + attribute.nodeName] = attribute.nodeValue;
                }
                for (node = element.firstChild; node; node = node.nextSibling) {
                    nodeType = node.nodeType;
                    if (nodeType === 3 || nodeType === 4) {
                        result['#text'] = node.nodeValue;
                    } else if (nodeType === 1) {
                        parsedNode = this.parseDOM(node);
                        nodeName = node.nodeName;
                        member = result[nodeName];
                        if (isArray(member)) {
                            member.push(parsedNode);
                        } else if (member !== undefined) {
                            member = [
                                member,
                                parsedNode
                            ];
                        } else {
                            member = parsedNode;
                        }
                        result[nodeName] = member;
                    }
                }
                return result;
            },
            evaluate: function (value, expression) {
                var members = expression.split('.'), member, result, length, intermediateResult, idx;
                while (member = members.shift()) {
                    value = value[member];
                    if (isArray(value)) {
                        result = [];
                        expression = members.join('.');
                        for (idx = 0, length = value.length; idx < length; idx++) {
                            intermediateResult = this.evaluate(value[idx], expression);
                            intermediateResult = isArray(intermediateResult) ? intermediateResult : [intermediateResult];
                            result.push.apply(result, intermediateResult);
                        }
                        return result;
                    }
                }
                return value;
            },
            parse: function (xml) {
                var documentElement, tree, result = {};
                documentElement = xml.documentElement || $.parseXML(xml).documentElement;
                tree = this.parseDOM(documentElement);
                result[documentElement.nodeName] = tree;
                return result;
            },
            xpathToMember: function (member, raw) {
                if (!member) {
                    return '';
                }
                member = member.replace(/^\//, '').replace(/\//g, '.');
                if (member.indexOf('@') >= 0) {
                    return member.replace(/\.?(@.*)/, raw ? '$1' : '["$1"]');
                }
                if (member.indexOf('text()') >= 0) {
                    return member.replace(/(\.?text\(\))/, raw ? '#text' : '["#text"]');
                }
                return member;
            },
            getter: function (member) {
                return getter(this.xpathToMember(member), true);
            }
        });
        $.extend(true, quilt.data, {
            XmlDataReader: XmlDataReader,
            readers: { xml: XmlDataReader }
        });
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.data', [
        'quilt.core',
        'quilt.data.odata',
        'quilt.data.xml'
    ], f);
}(function () {
    var __meta__ = {
        id: 'data',
        name: 'Data source',
        category: 'framework',
        description: 'Powerful component for using local and remote data.Fully supports CRUD, Sorting, Paging, Filtering, Grouping, and Aggregates.',
        depends: ['core'],
        features: [
            {
                id: 'data-odata',
                name: 'OData',
                description: 'Support for accessing Open Data Protocol (OData) services.',
                depends: ['data.odata']
            },
            {
                id: 'data-signalr',
                name: 'SignalR',
                description: 'Support for binding to SignalR hubs.',
                depends: ['data.signalr']
            },
            {
                id: 'data-XML',
                name: 'XML',
                description: 'Support for binding to XML.',
                depends: ['data.xml']
            }
        ]
    };
    (function ($, undefined) {
        var extend = $.extend, proxy = $.proxy, isPlainObject = $.isPlainObject, isEmptyObject = $.isEmptyObject, isArray = $.isArray, grep = $.grep, ajax = $.ajax, map, each = $.each, noop = $.noop, quilt = window.quilt, isFunction = quilt.isFunction, Observable = quilt.Observable, Class = quilt.Class, STRING = 'string', FUNCTION = 'function', ASCENDING = 'asc', CREATE = 'create', READ = 'read', UPDATE = 'update', DESTROY = 'destroy', CHANGE = 'change', SYNC = 'sync', GET = 'get', ERROR = 'error', REQUESTSTART = 'requestStart', PROGRESS = 'progress', REQUESTEND = 'requestEnd', crud = [
                CREATE,
                READ,
                UPDATE,
                DESTROY
            ], identity = function (o) {
                return o;
            }, getter = quilt.getter, stringify = quilt.stringify, math = Math, push = [].push, join = [].join, pop = [].pop, splice = [].splice, shift = [].shift, slice = [].slice, unshift = [].unshift, toString = {}.toString, stableSort = quilt.support.stableSort, dateRegExp = /^\/Date\((.*?)\)\/$/, objectKeys = [];
        var ObservableArray = Observable.extend({
            init: function (array, type) {
                var that = this;
                that.type = type || ObservableObject;
                Observable.fn.init.call(that);
                that.length = array.length;
                that.wrapAll(array, that);
            },
            at: function (index) {
                return this[index];
            },
            toJSON: function (serializeFunctions) {
                var idx, length = this.length, value, json = new Array(length);
                for (idx = 0; idx < length; idx++) {
                    value = this[idx];
                    if (value instanceof ObservableObject) {
                        value = value.toJSON(serializeFunctions);
                    }
                    json[idx] = value;
                }
                return json;
            },
            parent: noop,
            wrapAll: function (source, target) {
                var that = this, idx, length, parent = function () {
                        return that;
                    };
                target = target || [];
                for (idx = 0, length = source.length; idx < length; idx++) {
                    target[idx] = that.wrap(source[idx], parent);
                }
                return target;
            },
            wrap: function (object, parent) {
                var that = this, observable;
                if (object !== null && toString.call(object) === '[object Object]') {
                    observable = object instanceof that.type || object instanceof Model;
                    if (!observable) {
                        object = object instanceof ObservableObject ? object.toJSON() : object;
                        object = new that.type(object);
                    }
                    object.parent = parent;
                    object.bind(CHANGE, function (e) {
                        that.trigger(CHANGE, {
                            field: e.field,
                            node: e.node,
                            index: e.index,
                            items: e.items || [this],
                            action: e.node ? e.action || 'itemloaded' : 'itemchange'
                        });
                    });
                }
                return object;
            },
            push: function () {
                var index = this.length, items = this.wrapAll(arguments), result;
                result = push.apply(this, items);
                if (!this.omitChangeEvent) {
                    this.trigger(CHANGE, {
                        action: 'add',
                        index: index,
                        items: items
                    });
                }
                return result;
            },
            slice: slice,
            sort: [].sort,
            join: join,
            pop: function () {
                var length = this.length, result = pop.apply(this);
                if (length) {
                    this.trigger(CHANGE, {
                        action: 'remove',
                        index: length - 1,
                        items: [result]
                    });
                }
                return result;
            },
            splice: function (index, howMany, item) {
                var items = this.wrapAll(slice.call(arguments, 2)), result, i, len;
                result = splice.apply(this, [
                    index,
                    howMany
                ].concat(items));
                if (result.length) {
                    if (!this.omitChangeEvent) {
                        this.trigger(CHANGE, {
                            action: 'remove',
                            index: index,
                            items: result
                        });
                    }
                    for (i = 0, len = result.length; i < len; i++) {
                        if (result[i] && result[i].children) {
                            result[i].unbind(CHANGE);
                        }
                    }
                }
                if (item) {
                    if (!this.omitChangeEvent) {
                        this.trigger(CHANGE, {
                            action: 'add',
                            index: index,
                            items: items
                        });
                    }
                }
                return result;
            },
            shift: function () {
                var length = this.length, result = shift.apply(this);
                if (length) {
                    this.trigger(CHANGE, {
                        action: 'remove',
                        index: 0,
                        items: [result]
                    });
                }
                return result;
            },
            unshift: function () {
                var items = this.wrapAll(arguments), result;
                result = unshift.apply(this, items);
                this.trigger(CHANGE, {
                    action: 'add',
                    index: 0,
                    items: items
                });
                return result;
            },
            indexOf: function (item) {
                var that = this, idx, length;
                for (idx = 0, length = that.length; idx < length; idx++) {
                    if (that[idx] === item) {
                        return idx;
                    }
                }
                return -1;
            },
            forEach: function (callback, thisArg) {
                var idx = 0;
                var length = this.length;
                var context = thisArg || window;
                for (; idx < length; idx++) {
                    callback.call(context, this[idx], idx, this);
                }
            },
            map: function (callback, thisArg) {
                var idx = 0;
                var result = [];
                var length = this.length;
                var context = thisArg || window;
                for (; idx < length; idx++) {
                    result[idx] = callback.call(context, this[idx], idx, this);
                }
                return result;
            },
            reduce: function (callback) {
                var idx = 0, result, length = this.length;
                if (arguments.length == 2) {
                    result = arguments[1];
                } else if (idx < length) {
                    result = this[idx++];
                }
                for (; idx < length; idx++) {
                    result = callback(result, this[idx], idx, this);
                }
                return result;
            },
            reduceRight: function (callback) {
                var idx = this.length - 1, result;
                if (arguments.length == 2) {
                    result = arguments[1];
                } else if (idx > 0) {
                    result = this[idx--];
                }
                for (; idx >= 0; idx--) {
                    result = callback(result, this[idx], idx, this);
                }
                return result;
            },
            filter: function (callback, thisArg) {
                var idx = 0;
                var result = [];
                var item;
                var length = this.length;
                var context = thisArg || window;
                for (; idx < length; idx++) {
                    item = this[idx];
                    if (callback.call(context, item, idx, this)) {
                        result[result.length] = item;
                    }
                }
                return result;
            },
            find: function (callback, thisArg) {
                var idx = 0;
                var item;
                var length = this.length;
                var context = thisArg || window;
                for (; idx < length; idx++) {
                    item = this[idx];
                    if (callback.call(context, item, idx, this)) {
                        return item;
                    }
                }
            },
            every: function (callback, thisArg) {
                var idx = 0;
                var item;
                var length = this.length;
                var context = thisArg || window;
                for (; idx < length; idx++) {
                    item = this[idx];
                    if (!callback.call(context, item, idx, this)) {
                        return false;
                    }
                }
                return true;
            },
            some: function (callback, thisArg) {
                var idx = 0;
                var item;
                var length = this.length;
                var context = thisArg || window;
                for (; idx < length; idx++) {
                    item = this[idx];
                    if (callback.call(context, item, idx, this)) {
                        return true;
                    }
                }
                return false;
            },
            remove: function (item) {
                var idx = this.indexOf(item);
                if (idx !== -1) {
                    this.splice(idx, 1);
                }
            },
            empty: function () {
                this.splice(0, this.length);
            }
        });
        if (typeof Symbol !== 'undefined' && Symbol.iterator && !ObservableArray.prototype[Symbol.iterator]) {
            ObservableArray.prototype[Symbol.iterator] = [][Symbol.iterator];
        }
        var LazyObservableArray = ObservableArray.extend({
            init: function (data, type, events) {
                Observable.fn.init.call(this);
                this.type = type || ObservableObject;
                if (events) {
                    this._events = events;
                }
                for (var idx = 0; idx < data.length; idx++) {
                    this[idx] = data[idx];
                }
                this.length = idx;
                this._parent = proxy(function () {
                    return this;
                }, this);
            },
            at: function (index) {
                var item = this[index];
                if (!(item instanceof this.type)) {
                    item = this[index] = this.wrap(item, this._parent);
                } else {
                    item.parent = this._parent;
                }
                return item;
            }
        });
        function eventHandler(context, type, field, prefix) {
            return function (e) {
                var event = {}, key;
                for (key in e) {
                    event[key] = e[key];
                }
                if (prefix) {
                    event.field = field + '.' + e.field;
                } else {
                    event.field = field;
                }
                if (type == CHANGE && context._notifyChange) {
                    context._notifyChange(event);
                }
                context.trigger(type, event);
            };
        }
        function ownKeys(value, ignoreObjectKeys) {
            var props = [];
            var keys, filteredObjectKeys;
            value = value || {};
            keys = Object.getOwnPropertyNames(value);
            filteredObjectKeys = objectKeys.filter(function (key) {
                return keys.indexOf(key) < 0;
            });
            while (value) {
                Object.getOwnPropertyNames(value).forEach(function (prop) {
                    if (props.indexOf(prop) === -1 && (!ignoreObjectKeys || filteredObjectKeys.indexOf(prop) < 0)) {
                        props.push(prop);
                    }
                });
                value = Object.getPrototypeOf(value);
            }
            return props;
        }
        objectKeys = ownKeys({}, false);
        var ObservableObject = Observable.extend({
            init: function (value) {
                var that = this, member, keys = ownKeys(value, true), parent = function () {
                        return that;
                    };
                Observable.fn.init.call(this);
                this._handlers = {};
                keys.forEach(function (field) {
                    member = value[field];
                    if (typeof member === 'object' && member && !member.getTime && field.charAt(0) != '_') {
                        member = that.wrap(member, field, parent);
                    }
                    that[field] = member;
                });
                that.uid = quilt.guid();
            },
            shouldSerialize: function (field, serializeFunctions) {
                return this.hasOwnProperty(field) && field !== '_handlers' && field !== '_events' && (serializeFunctions && serializeFunctions[field] || typeof this[field] !== FUNCTION) && field !== 'uid';
            },
            forEach: function (f) {
                for (var i in this) {
                    if (this.shouldSerialize(i)) {
                        f(this[i], i);
                    }
                }
            },
            toJSON: function (serializeFunctions) {
                var result = {}, value, field;
                for (field in this) {
                    if (this.shouldSerialize(field, serializeFunctions)) {
                        value = this[field];
                        if (value instanceof ObservableObject || value instanceof ObservableArray) {
                            value = value.toJSON(serializeFunctions);
                        }
                        result[field] = value;
                    }
                }
                return result;
            },
            get: function (field) {
                var that = this, result;
                that.trigger(GET, { field: field });
                if (field === 'this') {
                    result = that;
                } else {
                    result = quilt.getter(field, true)(that);
                }
                return result;
            },
            _set: function (field, value) {
                var that = this;
                var composite = field.indexOf('.') >= 0;
                if (composite) {
                    var paths = field.split('.'), path = '';
                    while (paths.length > 1) {
                        path += paths.shift();
                        var obj = quilt.getter(path, true)(that);
                        if (obj instanceof ObservableObject) {
                            obj.set(paths.join('.'), value);
                            return composite;
                        }
                        path += '.';
                    }
                }
                quilt.setter(field)(that, value);
                return composite;
            },
            set: function (field, value) {
                var that = this, isSetPrevented = false, composite = field.indexOf('.') >= 0, current = quilt.getter(field, true)(that);
                if (current !== value) {
                    if (current instanceof Observable && this._handlers[field]) {
                        if (this._handlers[field].get) {
                            current.unbind(GET, this._handlers[field].get);
                        }
                        current.unbind(CHANGE, this._handlers[field].change);
                    }
                    isSetPrevented = that.trigger('set', {
                        field: field,
                        value: value
                    });
                    if (!isSetPrevented) {
                        if (!composite) {
                            value = that.wrap(value, field, function () {
                                return that;
                            });
                        }
                        if (!that._set(field, value) || field.indexOf('(') >= 0 || field.indexOf('[') >= 0) {
                            that.trigger(CHANGE, { field: field });
                        }
                    }
                }
                return isSetPrevented;
            },
            parent: noop,
            wrap: function (object, field, parent) {
                var that = this;
                var get;
                var change;
                var type = toString.call(object);
                if (object != null && (type === '[object Object]' || type === '[object Array]')) {
                    var isObservableArray = object instanceof ObservableArray;
                    var isDataSource = object instanceof DataSource;
                    if (type === '[object Object]' && !isDataSource && !isObservableArray) {
                        if (!(object instanceof ObservableObject)) {
                            object = new ObservableObject(object);
                        }
                        get = eventHandler(that, GET, field, true);
                        object.bind(GET, get);
                        change = eventHandler(that, CHANGE, field, true);
                        object.bind(CHANGE, change);
                        that._handlers[field] = {
                            get: get,
                            change: change
                        };
                    } else if (type === '[object Array]' || isObservableArray || isDataSource) {
                        if (!isObservableArray && !isDataSource) {
                            object = new ObservableArray(object);
                        }
                        change = eventHandler(that, CHANGE, field, false);
                        object.bind(CHANGE, change);
                        that._handlers[field] = { change: change };
                    }
                    object.parent = parent;
                }
                return object;
            }
        });
        function equal(x, y) {
            if (x === y) {
                return true;
            }
            var xtype = $.type(x), ytype = $.type(y), field;
            if (xtype !== ytype) {
                return false;
            }
            if (xtype === 'date') {
                return x.getTime() === y.getTime();
            }
            if (xtype !== 'object' && xtype !== 'array') {
                return false;
            }
            for (field in x) {
                if (!equal(x[field], y[field])) {
                    return false;
                }
            }
            return true;
        }
        var parsers = {
            'number': function (value) {
                if (typeof value === STRING && value.toLowerCase() === 'null') {
                    return null;
                }
                return quilt.parseFloat(value);
            },
            'date': function (value) {
                if (typeof value === STRING && value.toLowerCase() === 'null') {
                    return null;
                }
                return quilt.parseDate(value);
            },
            'boolean': function (value) {
                if (typeof value === STRING) {
                    if (value.toLowerCase() === 'null') {
                        return null;
                    } else {
                        return value.toLowerCase() === 'true';
                    }
                }
                return value != null ? !!value : value;
            },
            'string': function (value) {
                if (typeof value === STRING && value.toLowerCase() === 'null') {
                    return null;
                }
                return value != null ? value + '' : value;
            },
            'default': function (value) {
                return value;
            }
        };
        var defaultValues = {
            'string': '',
            'number': 0,
            'date': new Date(),
            'boolean': false,
            'default': ''
        };
        function getFieldByName(obj, name) {
            var field, fieldName;
            for (fieldName in obj) {
                field = obj[fieldName];
                if (isPlainObject(field) && field.field && field.field === name) {
                    return field;
                } else if (field === name) {
                    return field;
                }
            }
            return null;
        }
        var Model = ObservableObject.extend({
            init: function (data) {
                var that = this;
                if (!data || $.isEmptyObject(data)) {
                    data = $.extend({}, that.defaults, data);
                    if (that._initializers) {
                        for (var idx = 0; idx < that._initializers.length; idx++) {
                            var name = that._initializers[idx];
                            data[name] = that.defaults[name]();
                        }
                    }
                }
                ObservableObject.fn.init.call(that, data);
                that.dirty = false;
                that.dirtyFields = {};
                if (that.idField) {
                    that.id = that.get(that.idField);
                    if (that.id === undefined) {
                        that.id = that._defaultId;
                    }
                }
            },
            shouldSerialize: function (field) {
                return ObservableObject.fn.shouldSerialize.call(this, field) && field !== 'uid' && !(this.idField !== 'id' && field === 'id') && field !== 'dirty' && field !== 'dirtyFields' && field !== '_accessors';
            },
            _parse: function (field, value) {
                var that = this, fieldName = field, fields = that.fields || {}, parse;
                field = fields[field];
                if (!field) {
                    field = getFieldByName(fields, fieldName);
                }
                if (field) {
                    parse = field.parse;
                    if (!parse && field.type) {
                        parse = parsers[field.type.toLowerCase()];
                    }
                }
                return parse ? parse(value) : value;
            },
            _notifyChange: function (e) {
                var action = e.action;
                if (action == 'add' || action == 'remove') {
                    this.dirty = true;
                    this.dirtyFields[e.field] = true;
                }
            },
            editable: function (field) {
                field = (this.fields || {})[field];
                return field ? field.editable !== false : true;
            },
            set: function (field, value) {
                var that = this;
                var dirty = that.dirty;
                if (that.editable(field)) {
                    value = that._parse(field, value);
                    if (!equal(value, that.get(field))) {
                        that.dirty = true;
                        that.dirtyFields[field] = true;
                        if (ObservableObject.fn.set.call(that, field, value) && !dirty) {
                            that.dirty = dirty;
                            if (!that.dirty) {
                                that.dirtyFields[field] = false;
                            }
                        }
                    } else {
                        that.trigger('equalSet', {
                            field: field,
                            value: value
                        });
                    }
                }
            },
            accept: function (data) {
                var that = this, parent = function () {
                        return that;
                    }, field;
                for (field in data) {
                    var value = data[field];
                    if (field.charAt(0) != '_') {
                        value = that.wrap(data[field], field, parent);
                    }
                    that._set(field, value);
                }
                if (that.idField) {
                    that.id = that.get(that.idField);
                }
                that.dirty = false;
                that.dirtyFields = {};
            },
            isNew: function () {
                return this.id === this._defaultId;
            }
        });
        Model.define = function (base, options) {
            if (options === undefined) {
                options = base;
                base = Model;
            }
            var model, proto = extend({ defaults: {} }, options), name, field, type, value, idx, length, fields = {}, originalName, id = proto.id, functionFields = [];
            if (id) {
                proto.idField = id;
            }
            if (proto.id) {
                delete proto.id;
            }
            if (id) {
                proto.defaults[id] = proto._defaultId = '';
            }
            if (toString.call(proto.fields) === '[object Array]') {
                for (idx = 0, length = proto.fields.length; idx < length; idx++) {
                    field = proto.fields[idx];
                    if (typeof field === STRING) {
                        fields[field] = {};
                    } else if (field.field) {
                        fields[field.field] = field;
                    }
                }
                proto.fields = fields;
            }
            for (name in proto.fields) {
                field = proto.fields[name];
                type = field.type || 'default';
                value = null;
                originalName = name;
                name = typeof field.field === STRING ? field.field : name;
                if (!field.nullable) {
                    value = proto.defaults[originalName !== name ? originalName : name] = field.defaultValue !== undefined ? field.defaultValue : defaultValues[type.toLowerCase()];
                    if (typeof value === 'function') {
                        functionFields.push(name);
                    }
                }
                if (options.id === name) {
                    proto._defaultId = value;
                }
                proto.defaults[originalName !== name ? originalName : name] = value;
                field.parse = field.parse || parsers[type];
            }
            if (functionFields.length > 0) {
                proto._initializers = functionFields;
            }
            model = base.extend(proto);
            model.define = function (options) {
                return Model.define(model, options);
            };
            if (proto.fields) {
                model.fields = proto.fields;
                model.idField = proto.idField;
            }
            return model;
        };
        var Comparer = {
            selector: function (field) {
                return isFunction(field) ? field : getter(field);
            },
            compare: function (field) {
                var selector = this.selector(field);
                return function (a, b) {
                    a = selector(a);
                    b = selector(b);
                    if (a == null && b == null) {
                        return 0;
                    }
                    if (a == null) {
                        return -1;
                    }
                    if (b == null) {
                        return 1;
                    }
                    if (a.localeCompare) {
                        return a.localeCompare(b);
                    }
                    return a > b ? 1 : a < b ? -1 : 0;
                };
            },
            create: function (sort) {
                var compare = sort.compare || this.compare(sort.field);
                if (sort.dir == 'desc') {
                    return function (a, b) {
                        return compare(b, a, true);
                    };
                }
                return compare;
            },
            combine: function (comparers) {
                return function (a, b) {
                    var result = comparers[0](a, b), idx, length;
                    for (idx = 1, length = comparers.length; idx < length; idx++) {
                        result = result || comparers[idx](a, b);
                    }
                    return result;
                };
            }
        };
        var StableComparer = extend({}, Comparer, {
            asc: function (field) {
                var selector = this.selector(field);
                return function (a, b) {
                    var valueA = selector(a);
                    var valueB = selector(b);
                    if (valueA && valueA.getTime && valueB && valueB.getTime) {
                        valueA = valueA.getTime();
                        valueB = valueB.getTime();
                    }
                    if (valueA === valueB) {
                        return a.__position - b.__position;
                    }
                    if (valueA == null) {
                        return -1;
                    }
                    if (valueB == null) {
                        return 1;
                    }
                    if (valueA.localeCompare) {
                        return valueA.localeCompare(valueB);
                    }
                    return valueA > valueB ? 1 : -1;
                };
            },
            desc: function (field) {
                var selector = this.selector(field);
                return function (a, b) {
                    var valueA = selector(a);
                    var valueB = selector(b);
                    if (valueA && valueA.getTime && valueB && valueB.getTime) {
                        valueA = valueA.getTime();
                        valueB = valueB.getTime();
                    }
                    if (valueA === valueB) {
                        return a.__position - b.__position;
                    }
                    if (valueA == null) {
                        return 1;
                    }
                    if (valueB == null) {
                        return -1;
                    }
                    if (valueB.localeCompare) {
                        return valueB.localeCompare(valueA);
                    }
                    return valueA < valueB ? 1 : -1;
                };
            },
            create: function (sort) {
                return this[sort.dir](sort.field);
            }
        });
        map = function (array, callback) {
            var idx, length = array.length, result = new Array(length);
            for (idx = 0; idx < length; idx++) {
                result[idx] = callback(array[idx], idx, array);
            }
            return result;
        };
        var operators = function () {
            function quote(str) {
                if (typeof str == 'string') {
                    str = str.replace(/[\r\n]+/g, '');
                }
                return JSON.stringify(str);
            }
            function textOp(impl) {
                return function (a, b, ignore, accentFoldingFiltering) {
                    b += '';
                    if (ignore) {
                        a = '(' + a + ' + \'\').toString()' + (accentFoldingFiltering ? '.toLocaleLowerCase(\'' + accentFoldingFiltering + '\')' : '.toLowerCase()');
                        b = accentFoldingFiltering ? b.toLocaleLowerCase(accentFoldingFiltering) : b.toLowerCase();
                    }
                    return impl(a, quote(b), ignore);
                };
            }
            function operator(op, a, b, ignore, accentFoldingFiltering) {
                if (b != null) {
                    if (typeof b === STRING) {
                        var date = dateRegExp.exec(b);
                        if (date) {
                            b = new Date(+date[1]);
                        } else if (ignore) {
                            b = quote(accentFoldingFiltering ? b.toLocaleLowerCase(accentFoldingFiltering) : b.toLowerCase());
                            a = '((' + a + ' || \'\')+\'\')' + (accentFoldingFiltering ? '.toLocaleLowerCase(\'' + accentFoldingFiltering + '\')' : '.toLowerCase()');
                        } else {
                            b = quote(b);
                        }
                    }
                    if (b.getTime) {
                        a = '(' + a + '&&' + a + '.getTime?' + a + '.getTime():' + a + ')';
                        b = b.getTime();
                    }
                }
                return a + ' ' + op + ' ' + b;
            }
            function getMatchRegexp(pattern) {
                for (var rx = '/^', esc = false, i = 0; i < pattern.length; ++i) {
                    var ch = pattern.charAt(i);
                    if (esc) {
                        rx += '\\' + ch;
                    } else if (ch == '~') {
                        esc = true;
                        continue;
                    } else if (ch == '*') {
                        rx += '.*';
                    } else if (ch == '?') {
                        rx += '.';
                    } else if ('.+^$()[]{}|\\/\n\r\u2028\u2029\xA0'.indexOf(ch) >= 0) {
                        rx += '\\' + ch;
                    } else {
                        rx += ch;
                    }
                    esc = false;
                }
                return rx + '$/';
            }
            return {
                quote: function (value) {
                    if (value && value.getTime) {
                        return 'new Date(' + value.getTime() + ')';
                    }
                    return quote(value);
                },
                eq: function (a, b, ignore, accentFoldingFiltering) {
                    return operator('==', a, b, ignore, accentFoldingFiltering);
                },
                neq: function (a, b, ignore, accentFoldingFiltering) {
                    return operator('!=', a, b, ignore, accentFoldingFiltering);
                },
                gt: function (a, b, ignore) {
                    return operator('>', a, b, ignore);
                },
                gte: function (a, b, ignore) {
                    return operator('>=', a, b, ignore);
                },
                lt: function (a, b, ignore) {
                    return operator('<', a, b, ignore);
                },
                lte: function (a, b, ignore) {
                    return operator('<=', a, b, ignore);
                },
                startswith: textOp(function (a, b) {
                    return a + '.lastIndexOf(' + b + ', 0) == 0';
                }),
                doesnotstartwith: textOp(function (a, b) {
                    return a + '.lastIndexOf(' + b + ', 0) == -1';
                }),
                endswith: textOp(function (a, b) {
                    var n = b ? b.length - 2 : 0;
                    return a + '.indexOf(' + b + ', ' + a + '.length - ' + n + ') >= 0';
                }),
                doesnotendwith: textOp(function (a, b) {
                    var n = b ? b.length - 2 : 0;
                    return a + '.indexOf(' + b + ', ' + a + '.length - ' + n + ') < 0';
                }),
                contains: textOp(function (a, b) {
                    return a + '.indexOf(' + b + ') >= 0';
                }),
                doesnotcontain: textOp(function (a, b) {
                    return a + '.indexOf(' + b + ') == -1';
                }),
                matches: textOp(function (a, b) {
                    b = b.substring(1, b.length - 1);
                    return getMatchRegexp(b) + '.test(' + a + ')';
                }),
                doesnotmatch: textOp(function (a, b) {
                    b = b.substring(1, b.length - 1);
                    return '!' + getMatchRegexp(b) + '.test(' + a + ')';
                }),
                isempty: function (a) {
                    return a + ' === \'\'';
                },
                isnotempty: function (a) {
                    return a + ' !== \'\'';
                },
                isnull: function (a) {
                    return '(' + a + ' == null)';
                },
                isnotnull: function (a) {
                    return '(' + a + ' != null)';
                },
                isnullorempty: function (a) {
                    return '(' + a + ' === null) || (' + a + ' === \'\')';
                },
                isnotnullorempty: function (a) {
                    return '(' + a + ' !== null) && (' + a + ' !== \'\')';
                }
            };
        }();
        function Query(data) {
            this.data = data || [];
        }
        Query.filterExpr = function (expression) {
            var expressions = [], logic = {
                    and: ' && ',
                    or: ' || '
                }, idx, length, filter, expr, fieldFunctions = [], operatorFunctions = [], field, operator, filters = expression.filters;
            for (idx = 0, length = filters.length; idx < length; idx++) {
                filter = filters[idx];
                field = filter.field;
                operator = filter.operator;
                if (filter.filters) {
                    expr = Query.filterExpr(filter);
                    filter = expr.expression.replace(/__o\[(\d+)\]/g, function (match, index) {
                        index = +index;
                        return '__o[' + (operatorFunctions.length + index) + ']';
                    }).replace(/__f\[(\d+)\]/g, function (match, index) {
                        index = +index;
                        return '__f[' + (fieldFunctions.length + index) + ']';
                    });
                    operatorFunctions.push.apply(operatorFunctions, expr.operators);
                    fieldFunctions.push.apply(fieldFunctions, expr.fields);
                } else {
                    if (typeof field === FUNCTION) {
                        expr = '__f[' + fieldFunctions.length + '](d)';
                        fieldFunctions.push(field);
                    } else {
                        expr = quilt.expr(field);
                    }
                    if (typeof operator === FUNCTION) {
                        filter = '__o[' + operatorFunctions.length + '](' + expr + ', ' + operators.quote(filter.value) + ')';
                        operatorFunctions.push(operator);
                    } else {
                        filter = operators[(operator || 'eq').toLowerCase()](expr, filter.value, filter.ignoreCase !== undefined ? filter.ignoreCase : true, expression.accentFoldingFiltering);
                    }
                }
                expressions.push(filter);
            }
            return {
                expression: '(' + expressions.join(logic[expression.logic]) + ')',
                fields: fieldFunctions,
                operators: operatorFunctions
            };
        };
        function normalizeSort(field, dir) {
            if (field) {
                var descriptor = typeof field === STRING ? {
                        field: field,
                        dir: dir
                    } : field, descriptors = isArray(descriptor) ? descriptor : descriptor !== undefined ? [descriptor] : [];
                return grep(descriptors, function (d) {
                    return !!d.dir;
                });
            }
        }
        function sortFields(sorts, dir) {
            var sortObject = {};
            if (sorts) {
                var descriptor = typeof sorts === STRING ? {
                        field: sorts,
                        dir: dir
                    } : sorts, descriptors = isArray(descriptor) ? descriptor : descriptor !== undefined ? [descriptor] : [];
                for (var i = 0; i < descriptors.length; i++) {
                    sortObject[descriptors[i].field] = {
                        dir: descriptors[i].dir,
                        index: i + 1
                    };
                }
            }
            return sortObject;
        }
        var operatorMap = {
            '==': 'eq',
            equals: 'eq',
            isequalto: 'eq',
            equalto: 'eq',
            equal: 'eq',
            '!=': 'neq',
            ne: 'neq',
            notequals: 'neq',
            isnotequalto: 'neq',
            notequalto: 'neq',
            notequal: 'neq',
            '<': 'lt',
            islessthan: 'lt',
            lessthan: 'lt',
            less: 'lt',
            '<=': 'lte',
            le: 'lte',
            islessthanorequalto: 'lte',
            lessthanequal: 'lte',
            '>': 'gt',
            isgreaterthan: 'gt',
            greaterthan: 'gt',
            greater: 'gt',
            '>=': 'gte',
            isgreaterthanorequalto: 'gte',
            greaterthanequal: 'gte',
            ge: 'gte',
            notsubstringof: 'doesnotcontain',
            isnull: 'isnull',
            isempty: 'isempty',
            isnotempty: 'isnotempty'
        };
        function normalizeOperator(expression) {
            var idx, length, filter, operator, filters = expression.filters;
            if (filters) {
                for (idx = 0, length = filters.length; idx < length; idx++) {
                    filter = filters[idx];
                    operator = filter.operator;
                    if (operator && typeof operator === STRING) {
                        filter.operator = operatorMap[operator.toLowerCase()] || operator;
                    }
                    normalizeOperator(filter);
                }
            }
        }
        function normalizeFilter(expression) {
            if (expression && !isEmptyObject(expression)) {
                if (isArray(expression) || !expression.filters) {
                    expression = {
                        logic: 'and',
                        filters: isArray(expression) ? expression : [expression]
                    };
                }
                normalizeOperator(expression);
                return expression;
            }
        }
        Query.normalizeFilter = normalizeFilter;
        function compareDescriptor(f1, f2) {
            if (f1.logic || f2.logic) {
                return false;
            }
            return f1.field === f2.field && f1.value === f2.value && f1.operator === f2.operator;
        }
        function normalizeDescriptor(filter) {
            filter = filter || {};
            if (isEmptyObject(filter)) {
                return {
                    logic: 'and',
                    filters: []
                };
            }
            return normalizeFilter(filter);
        }
        function fieldComparer(a, b) {
            if (b.logic || a.field > b.field) {
                return 1;
            } else if (a.field < b.field) {
                return -1;
            } else {
                return 0;
            }
        }
        function compareFilters(expr1, expr2) {
            expr1 = normalizeDescriptor(expr1);
            expr2 = normalizeDescriptor(expr2);
            if (expr1.logic !== expr2.logic) {
                return false;
            }
            var f1, f2;
            var filters1 = (expr1.filters || []).slice();
            var filters2 = (expr2.filters || []).slice();
            if (filters1.length !== filters2.length) {
                return false;
            }
            filters1 = filters1.sort(fieldComparer);
            filters2 = filters2.sort(fieldComparer);
            for (var idx = 0; idx < filters1.length; idx++) {
                f1 = filters1[idx];
                f2 = filters2[idx];
                if (f1.logic && f2.logic) {
                    if (!compareFilters(f1, f2)) {
                        return false;
                    }
                } else if (!compareDescriptor(f1, f2)) {
                    return false;
                }
            }
            return true;
        }
        Query.compareFilters = compareFilters;
        function normalizeAggregate(expressions) {
            return isArray(expressions) ? expressions : [expressions];
        }
        function normalizeGroup(field, dir, compare, skipItemSorting) {
            var descriptor = typeof field === STRING ? {
                    field: field,
                    dir: dir,
                    compare: compare,
                    skipItemSorting: skipItemSorting
                } : field, descriptors = isArray(descriptor) ? descriptor : descriptor !== undefined ? [descriptor] : [];
            return map(descriptors, function (d) {
                return {
                    field: d.field,
                    dir: d.dir || 'asc',
                    aggregates: d.aggregates,
                    compare: d.compare,
                    skipItemSorting: d.skipItemSorting
                };
            });
        }
        function normalizeGroupWithoutCompare(field, dir, compare) {
            var descriptors = normalizeGroup(field, dir, compare);
            for (var i = 0; i < descriptors.length; i++) {
                delete descriptors[i].compare;
            }
            return descriptors;
        }
        function anyGroupDescriptorHasCompare(groupDescriptors) {
            var descriptors = isArray(groupDescriptors) ? groupDescriptors : [groupDescriptors];
            for (var i = 0; i < descriptors.length; i++) {
                if (descriptors[i] && isFunction(descriptors[i].compare)) {
                    return true;
                }
            }
            return false;
        }
        Query.prototype = {
            toArray: function () {
                return this.data;
            },
            range: function (index, count) {
                return new Query(this.data.slice(index, index + count));
            },
            skip: function (count) {
                return new Query(this.data.slice(count));
            },
            take: function (count) {
                return new Query(this.data.slice(0, count));
            },
            select: function (selector) {
                return new Query(map(this.data, selector));
            },
            order: function (selector, dir, inPlace) {
                var sort = { dir: dir };
                if (selector) {
                    if (selector.compare) {
                        sort.compare = selector.compare;
                    } else {
                        sort.field = selector;
                    }
                }
                if (inPlace) {
                    return new Query(this.data.sort(Comparer.create(sort)));
                }
                return new Query(this.data.slice(0).sort(Comparer.create(sort)));
            },
            orderBy: function (selector, inPlace) {
                return this.order(selector, 'asc', inPlace);
            },
            orderByDescending: function (selector, inPlace) {
                return this.order(selector, 'desc', inPlace);
            },
            sort: function (field, dir, comparer, inPlace) {
                var idx, length, descriptors = normalizeSort(field, dir), comparers = [];
                comparer = comparer || Comparer;
                if (descriptors.length) {
                    for (idx = 0, length = descriptors.length; idx < length; idx++) {
                        comparers.push(comparer.create(descriptors[idx]));
                    }
                    return this.orderBy({ compare: comparer.combine(comparers) }, inPlace);
                }
                return this;
            },
            filter: function (expressions) {
                var idx, current, length, compiled, predicate, data = this.data, fields, operators, result = [], filter;
                expressions = normalizeFilter(expressions);
                if (!expressions || expressions.filters.length === 0) {
                    return this;
                }
                compiled = Query.filterExpr(expressions);
                fields = compiled.fields;
                operators = compiled.operators;
                predicate = filter = new Function('d, __f, __o', 'return ' + compiled.expression);
                if (fields.length || operators.length) {
                    filter = function (d) {
                        return predicate(d, fields, operators);
                    };
                }
                for (idx = 0, length = data.length; idx < length; idx++) {
                    current = data[idx];
                    if (filter(current)) {
                        result.push(current);
                    }
                }
                return new Query(result);
            },
            group: function (descriptors, allData, options) {
                descriptors = normalizeGroup(descriptors || []);
                allData = allData || this.data;
                var that = this, result = new Query(that.data), descriptor;
                if (descriptors.length > 0) {
                    descriptor = descriptors[0];
                    if (options && options.groupPaging) {
                        result = new Query(allData).groupAllData(descriptor, allData).select(function (group) {
                            var data = new Query(allData).filter([{
                                    field: group.field,
                                    operator: 'eq',
                                    value: group.value,
                                    ignoreCase: false
                                }]);
                            var items = descriptors.length > 1 ? new Query(group.items).group(descriptors.slice(1), data.toArray(), options).toArray() : group.items;
                            return {
                                field: group.field,
                                value: group.value,
                                hasSubgroups: descriptors.length > 1,
                                items: items,
                                aggregates: data.aggregate(descriptor.aggregates),
                                uid: quilt.guid(),
                                itemCount: items.length,
                                subgroupCount: items.length
                            };
                        });
                    } else {
                        result = result.groupBy(descriptor).select(function (group) {
                            var data = new Query(allData).filter([{
                                    field: group.field,
                                    operator: 'eq',
                                    value: group.value,
                                    ignoreCase: false
                                }]);
                            return {
                                field: group.field,
                                value: group.value,
                                items: descriptors.length > 1 ? new Query(group.items).group(descriptors.slice(1), data.toArray()).toArray() : group.items,
                                hasSubgroups: descriptors.length > 1,
                                aggregates: data.aggregate(descriptor.aggregates)
                            };
                        });
                    }
                }
                return result;
            },
            groupBy: function (descriptor) {
                var that = this;
                if (isEmptyObject(descriptor) || !this.data.length) {
                    return new Query([]);
                }
                var field = descriptor.field, sorted = descriptor.skipItemSorting ? this.data : this._sortForGrouping(field, descriptor.dir || 'asc'), accessor = quilt.accessor(field), item, groupValue = accessor.get(sorted[0], field), group = {
                        field: field,
                        value: groupValue,
                        items: []
                    }, currentValue, idx, len, result = [group];
                for (idx = 0, len = sorted.length; idx < len; idx++) {
                    item = sorted[idx];
                    currentValue = accessor.get(item, field);
                    if (!groupValueComparer(groupValue, currentValue)) {
                        groupValue = currentValue;
                        group = {
                            field: field,
                            value: groupValue,
                            items: []
                        };
                        result.push(group);
                    }
                    group.items.push(item);
                }
                result = that._sortGroups(result, descriptor);
                return new Query(result);
            },
            groupAllData: function (descriptor, allData) {
                if (isEmptyObject(descriptor) || this.data && !this.data.length) {
                    return new Query([]);
                }
                var field = descriptor.field, sorted = descriptor.skipItemSorting ? allData : new Query(allData).sort(field, descriptor.dir || 'asc', StableComparer).toArray(), accessor = quilt.accessor(field), item, groupValue = accessor.get(sorted[0], field), group = {
                        field: field,
                        value: groupValue,
                        items: []
                    }, currentValue, idx, len, result = [group];
                for (idx = 0, len = sorted.length; idx < len; idx++) {
                    item = sorted[idx];
                    currentValue = accessor.get(item, field);
                    if (!groupValueComparer(groupValue, currentValue)) {
                        groupValue = currentValue;
                        group = {
                            field: field,
                            value: groupValue,
                            items: []
                        };
                        result.push(group);
                    }
                    group.items.push(item);
                }
                result = this._sortGroups(result, descriptor);
                return new Query(result);
            },
            _sortForGrouping: function (field, dir) {
                var idx, length, data = this.data;
                if (!stableSort) {
                    for (idx = 0, length = data.length; idx < length; idx++) {
                        data[idx].__position = idx;
                    }
                    data = new Query(data).sort(field, dir, StableComparer).toArray();
                    for (idx = 0, length = data.length; idx < length; idx++) {
                        delete data[idx].__position;
                    }
                    return data;
                }
                return this.sort(field, dir).toArray();
            },
            _sortGroups: function (groups, descriptor) {
                var result = groups;
                if (descriptor && isFunction(descriptor.compare)) {
                    result = new Query(result).order({ compare: descriptor.compare }, descriptor.dir || ASCENDING).toArray();
                }
                return result;
            },
            aggregate: function (aggregates) {
                var idx, len, result = {}, state = {};
                if (aggregates && aggregates.length) {
                    for (idx = 0, len = this.data.length; idx < len; idx++) {
                        calculateAggregate(result, aggregates, this.data[idx], idx, len, state);
                    }
                }
                return result;
            }
        };
        function groupValueComparer(a, b) {
            if (a && a.getTime && b && b.getTime) {
                return a.getTime() === b.getTime();
            }
            return a === b;
        }
        function calculateAggregate(accumulator, aggregates, item, index, length, state) {
            aggregates = aggregates || [];
            var idx, aggr, functionName, len = aggregates.length;
            for (idx = 0; idx < len; idx++) {
                aggr = aggregates[idx];
                functionName = aggr.aggregate;
                var field = aggr.field;
                accumulator[field] = accumulator[field] || {};
                state[field] = state[field] || {};
                state[field][functionName] = state[field][functionName] || {};
                accumulator[field][functionName] = functions[functionName.toLowerCase()](accumulator[field][functionName], item, quilt.accessor(field), index, length, state[field][functionName]);
            }
        }
        var functions = {
            sum: function (accumulator, item, accessor) {
                var value = accessor.get(item);
                if (!isNumber(accumulator)) {
                    accumulator = value;
                } else if (isNumber(value)) {
                    accumulator += value;
                }
                return accumulator;
            },
            count: function (accumulator) {
                return (accumulator || 0) + 1;
            },
            average: function (accumulator, item, accessor, index, length, state) {
                var value = accessor.get(item);
                if (state.count === undefined) {
                    state.count = 0;
                }
                if (!isNumber(accumulator)) {
                    accumulator = value;
                } else if (isNumber(value)) {
                    accumulator += value;
                }
                if (isNumber(value)) {
                    state.count++;
                }
                if (index == length - 1 && isNumber(accumulator)) {
                    accumulator = accumulator / state.count;
                }
                return accumulator;
            },
            max: function (accumulator, item, accessor) {
                var value = accessor.get(item);
                if (!isNumber(accumulator) && !isDate(accumulator)) {
                    accumulator = value;
                }
                if (accumulator < value && (isNumber(value) || isDate(value))) {
                    accumulator = value;
                }
                return accumulator;
            },
            min: function (accumulator, item, accessor) {
                var value = accessor.get(item);
                if (!isNumber(accumulator) && !isDate(accumulator)) {
                    accumulator = value;
                }
                if (accumulator > value && (isNumber(value) || isDate(value))) {
                    accumulator = value;
                }
                return accumulator;
            }
        };
        function isNumber(val) {
            return typeof val === 'number' && !isNaN(val);
        }
        function isDate(val) {
            return val && val.getTime;
        }
        function toJSON(array) {
            var idx, length = array.length, result = new Array(length);
            for (idx = 0; idx < length; idx++) {
                result[idx] = array[idx].toJSON();
            }
            return result;
        }
        Query.normalizeGroup = normalizeGroup;
        Query.normalizeSort = normalizeSort;
        Query.process = function (data, options, inPlace) {
            options = options || {};
            var group = options.group;
            var customGroupSort = anyGroupDescriptorHasCompare(normalizeGroup(group || []));
            var query = new Query(data), groupDescriptorsWithoutCompare = normalizeGroupWithoutCompare(group || []), normalizedSort = normalizeSort(options.sort || []), sort = customGroupSort ? normalizedSort : groupDescriptorsWithoutCompare.concat(normalizedSort), groupDescriptorsWithoutSort, total, filterCallback = options.filterCallback, filter = options.filter, skip = options.skip, take = options.take;
            if (sort && inPlace) {
                query = query.sort(sort, undefined, undefined, inPlace);
            }
            if (filter) {
                query = query.filter(filter);
                if (filterCallback) {
                    query = filterCallback(query);
                }
                total = query.toArray().length;
            }
            if (sort) {
                if (!inPlace) {
                    query = query.sort(sort);
                }
                if (group) {
                    data = query.toArray();
                }
            }
            if (customGroupSort) {
                query = query.group(group, data, options);
                if (skip !== undefined && take !== undefined && !options.groupPaging) {
                    query = new Query(flatGroups(query.toArray())).range(skip, take);
                    groupDescriptorsWithoutSort = map(groupDescriptorsWithoutCompare, function (groupDescriptor) {
                        return extend({}, groupDescriptor, { skipItemSorting: true });
                    });
                    query = query.group(groupDescriptorsWithoutSort, data, options);
                }
            } else {
                if (skip !== undefined && take !== undefined) {
                    query = query.range(skip, take);
                }
                if (group) {
                    query = query.group(group, data, options);
                }
            }
            return {
                total: total,
                data: query.toArray()
            };
        };
        var LocalTransport = Class.extend({
            init: function (options) {
                this.data = options.data;
            },
            read: function (options) {
                options.success(this.data);
            },
            update: function (options) {
                options.success(options.data);
            },
            create: function (options) {
                options.success(options.data);
            },
            destroy: function (options) {
                options.success(options.data);
            }
        });
        var RemoteTransport = Class.extend({
            init: function (options) {
                var that = this, parameterMap;
                options = that.options = extend({}, that.options, options);
                each(crud, function (index, type) {
                    if (typeof options[type] === STRING) {
                        options[type] = { url: options[type] };
                    }
                });
                that.cache = options.cache ? Cache.create(options.cache) : {
                    find: noop,
                    add: noop
                };
                parameterMap = options.parameterMap;
                if (options.submit) {
                    that.submit = options.submit;
                }
                if (isFunction(options.push)) {
                    that.push = options.push;
                }
                if (!that.push) {
                    that.push = identity;
                }
                that.parameterMap = isFunction(parameterMap) ? parameterMap : function (options) {
                    var result = {};
                    each(options, function (option, value) {
                        if (option in parameterMap) {
                            option = parameterMap[option];
                            if (isPlainObject(option)) {
                                value = option.value(value);
                                option = option.key;
                            }
                        }
                        result[option] = value;
                    });
                    return result;
                };
            },
            options: { parameterMap: identity },
            create: function (options) {
                return ajax(this.setup(options, CREATE));
            },
            read: function (options) {
                var that = this, success, error, result, cache = that.cache;
                options = that.setup(options, READ);
                success = options.success || noop;
                error = options.error || noop;
                result = cache.find(options.data);
                if (result !== undefined) {
                    success(result);
                } else {
                    options.success = function (result) {
                        cache.add(options.data, result);
                        success(result);
                    };
                    $.ajax(options);
                }
            },
            update: function (options) {
                return ajax(this.setup(options, UPDATE));
            },
            destroy: function (options) {
                return ajax(this.setup(options, DESTROY));
            },
            setup: function (options, type) {
                options = options || {};
                var that = this, parameters, operation = that.options[type], data = isFunction(operation.data) ? operation.data(options.data) : operation.data;
                options = extend(true, {}, operation, options);
                parameters = extend(true, {}, data, options.data);
                options.data = that.parameterMap(parameters, type);
                if (isFunction(options.url)) {
                    options.url = options.url(parameters);
                }
                return options;
            }
        });
        var Cache = Class.extend({
            init: function () {
                this._store = {};
            },
            add: function (key, data) {
                if (key !== undefined) {
                    this._store[stringify(key)] = data;
                }
            },
            find: function (key) {
                return this._store[stringify(key)];
            },
            clear: function () {
                this._store = {};
            },
            remove: function (key) {
                delete this._store[stringify(key)];
            }
        });
        Cache.create = function (options) {
            var store = {
                'inmemory': function () {
                    return new Cache();
                }
            };
            if (isPlainObject(options) && isFunction(options.find)) {
                return options;
            }
            if (options === true) {
                return new Cache();
            }
            return store[options]();
        };
        function serializeRecords(data, getters, modelInstance, originalFieldNames, fieldNames) {
            var record, getter, originalName, idx, setters = {}, length;
            for (idx = 0, length = data.length; idx < length; idx++) {
                record = data[idx];
                for (getter in getters) {
                    originalName = fieldNames[getter];
                    if (originalName && originalName !== getter) {
                        if (!setters[originalName]) {
                            setters[originalName] = quilt.setter(originalName);
                        }
                        setters[originalName](record, getters[getter](record));
                        delete record[getter];
                    }
                }
            }
        }
        function convertRecords(data, getters, modelInstance, originalFieldNames, fieldNames) {
            var record, getter, originalName, idx, length;
            for (idx = 0, length = data.length; idx < length; idx++) {
                record = data[idx];
                for (getter in getters) {
                    record[getter] = modelInstance._parse(getter, getters[getter](record));
                    originalName = fieldNames[getter];
                    if (originalName && originalName !== getter) {
                        delete record[originalName];
                    }
                }
            }
        }
        function convertGroup(data, getters, modelInstance, originalFieldNames, fieldNames) {
            var record, idx, fieldName, length;
            for (idx = 0, length = data.length; idx < length; idx++) {
                record = data[idx];
                fieldName = originalFieldNames[record.field];
                if (fieldName && fieldName != record.field) {
                    record.field = fieldName;
                }
                record.value = modelInstance._parse(record.field, record.value);
                if (record.items) {
                    if (record.hasSubgroups) {
                        convertGroup(record.items, getters, modelInstance, originalFieldNames, fieldNames);
                    } else {
                        convertRecords(record.items, getters, modelInstance, originalFieldNames, fieldNames);
                    }
                }
            }
        }
        function wrapDataAccess(originalFunction, model, converter, getters, originalFieldNames, fieldNames) {
            return function (data) {
                data = originalFunction(data);
                return wrapDataAccessBase(model, converter, getters, originalFieldNames, fieldNames)(data);
            };
        }
        function wrapDataAccessBase(model, converter, getters, originalFieldNames, fieldNames) {
            return function (data) {
                if (data && !isEmptyObject(getters)) {
                    if (toString.call(data) !== '[object Array]' && !(data instanceof ObservableArray)) {
                        data = [data];
                    }
                    converter(data, getters, new model(), originalFieldNames, fieldNames);
                }
                return data || [];
            };
        }
        var DataReader = Class.extend({
            init: function (schema) {
                var that = this, member, get, model, base;
                schema = schema || {};
                for (member in schema) {
                    get = schema[member];
                    that[member] = typeof get === STRING ? getter(get) : get;
                }
                base = schema.modelBase || Model;
                if (isPlainObject(that.model)) {
                    that.model = model = base.define(that.model);
                }
                var dataFunction = proxy(that.data, that);
                that._dataAccessFunction = dataFunction;
                if (that.model) {
                    var groupsFunction = proxy(that.groups, that), serializeFunction = proxy(that.serialize, that), originalFieldNames = {}, getters = {}, serializeGetters = {}, fieldNames = {}, shouldSerialize = false, fieldName, name;
                    model = that.model;
                    if (model.fields) {
                        each(model.fields, function (field, value) {
                            var fromName;
                            fieldName = field;
                            if (isPlainObject(value) && value.field) {
                                fieldName = value.field;
                            } else if (typeof value === STRING) {
                                fieldName = value;
                            }
                            if (isPlainObject(value) && value.from) {
                                fromName = value.from;
                            }
                            shouldSerialize = shouldSerialize || fromName && fromName !== field || fieldName !== field;
                            name = fromName || fieldName;
                            getters[field] = name.indexOf('.') !== -1 ? getter(name, true) : getter(name);
                            serializeGetters[field] = getter(field);
                            originalFieldNames[fromName || fieldName] = field;
                            fieldNames[field] = fromName || fieldName;
                        });
                        if (!schema.serialize && shouldSerialize) {
                            that.serialize = wrapDataAccess(serializeFunction, model, serializeRecords, serializeGetters, originalFieldNames, fieldNames);
                        }
                    }
                    that._dataAccessFunction = dataFunction;
                    that._wrapDataAccessBase = wrapDataAccessBase(model, convertRecords, getters, originalFieldNames, fieldNames);
                    that.data = wrapDataAccess(dataFunction, model, convertRecords, getters, originalFieldNames, fieldNames);
                    that.groups = wrapDataAccess(groupsFunction, model, convertGroup, getters, originalFieldNames, fieldNames);
                }
            },
            errors: function (data) {
                return data ? data.errors : null;
            },
            parse: identity,
            data: identity,
            total: function (data) {
                return data.length;
            },
            groups: identity,
            aggregates: function () {
                return {};
            },
            serialize: function (data) {
                return data;
            }
        });
        function fillLastGroup(originalGroup, newGroup) {
            var currOriginal;
            var currentNew;
            if (newGroup.items && newGroup.items.length) {
                for (var i = 0; i < newGroup.items.length; i++) {
                    currOriginal = originalGroup.items[originalGroup.items.length - 1];
                    currentNew = newGroup.items[i];
                    if (currOriginal && currentNew) {
                        if (currOriginal.hasSubgroups && currOriginal.value == currentNew.value) {
                            fillLastGroup(currOriginal, currentNew);
                        } else if (currOriginal.field && currOriginal.value == currentNew.value) {
                            currOriginal.items.push.apply(currOriginal.items, currentNew.items);
                        } else {
                            originalGroup.items.push.apply(originalGroup.items, [currentNew]);
                        }
                    } else if (currentNew) {
                        originalGroup.items.push.apply(originalGroup.items, [currentNew]);
                    }
                }
            }
        }
        function mergeGroups(target, dest, skip, take) {
            var group, idx = 0, items;
            while (dest.length && take) {
                group = dest[idx];
                items = group.items;
                var length = items.length;
                if (target && target.field === group.field && target.value === group.value) {
                    if (target.hasSubgroups && target.items.length) {
                        mergeGroups(target.items[target.items.length - 1], group.items, skip, take);
                    } else {
                        items = items.slice(skip, skip + take);
                        target.items = target.items.concat(items);
                    }
                    dest.splice(idx--, 1);
                } else if (group.hasSubgroups && items.length) {
                    mergeGroups(group, items, skip, take);
                    if (!group.items.length) {
                        dest.splice(idx--, 1);
                    }
                } else {
                    items = items.slice(skip, skip + take);
                    group.items = items;
                    if (!group.items.length) {
                        dest.splice(idx--, 1);
                    }
                }
                if (items.length === 0) {
                    skip -= length;
                } else {
                    skip = 0;
                    take -= items.length;
                }
                if (++idx >= dest.length) {
                    break;
                }
            }
            if (idx < dest.length) {
                dest.splice(idx, dest.length - idx);
            }
        }
        function flatGroups(groups, indexFunction) {
            var result = [];
            var groupsLength = (groups || []).length;
            var group;
            var items;
            var indexFn = isFunction(indexFunction) ? indexFunction : function (array, index) {
                return array[index];
            };
            for (var groupIndex = 0; groupIndex < groupsLength; groupIndex++) {
                group = indexFn(groups, groupIndex);
                if (group.hasSubgroups) {
                    result = result.concat(flatGroups(group.items));
                } else {
                    items = group.items;
                    for (var itemIndex = 0; itemIndex < items.length; itemIndex++) {
                        result.push(indexFn(items, itemIndex));
                    }
                }
            }
            return result;
        }
        function flattenGroups(data) {
            var idx, result = [], length, items, itemIndex;
            for (idx = 0, length = data.length; idx < length; idx++) {
                var group = data.at(idx);
                if (group.items) {
                    if (group.hasSubgroups) {
                        result = result.concat(flattenGroups(group.items));
                    } else {
                        items = group.items;
                        for (itemIndex = 0; itemIndex < items.length; itemIndex++) {
                            result.push(items.at(itemIndex));
                        }
                    }
                }
            }
            return result;
        }
        function wrapGroupItems(data, model) {
            var idx, length, group;
            if (model) {
                for (idx = 0, length = data.length; idx < length; idx++) {
                    group = data.at(idx);
                    if (group.items) {
                        if (group.hasSubgroups) {
                            wrapGroupItems(group.items, model);
                        } else {
                            group.items = new LazyObservableArray(group.items, model, group.items._events);
                        }
                    }
                }
            }
        }
        function eachGroupItems(data, func) {
            for (var idx = 0; idx < data.length; idx++) {
                if (data[idx].hasSubgroups) {
                    if (eachGroupItems(data[idx].items, func)) {
                        return true;
                    }
                } else if (func(data[idx].items, data[idx])) {
                    return true;
                }
            }
        }
        function replaceInRanges(ranges, data, item, observable) {
            for (var idx = 0; idx < ranges.length; idx++) {
                if (ranges[idx].data === data) {
                    break;
                }
                if (replaceInRange(ranges[idx].data, item, observable)) {
                    break;
                }
            }
        }
        function replaceInRange(items, item, observable) {
            for (var idx = 0, length = items.length; idx < length; idx++) {
                if (items[idx] && items[idx].hasSubgroups) {
                    return replaceInRange(items[idx].items, item, observable);
                } else if (items[idx] === item || items[idx] === observable) {
                    items[idx] = observable;
                    return true;
                }
            }
        }
        function replaceWithObservable(view, data, ranges, type, serverGrouping) {
            for (var viewIndex = 0, length = view.length; viewIndex < length; viewIndex++) {
                var item = view[viewIndex];
                if (!item || item instanceof type) {
                    continue;
                }
                if (item.hasSubgroups !== undefined && !serverGrouping) {
                    replaceWithObservable(item.items, data, ranges, type, serverGrouping);
                } else {
                    for (var idx = 0; idx < data.length; idx++) {
                        if (data[idx] === item) {
                            view[viewIndex] = data.at(idx);
                            replaceInRanges(ranges, data, item, view[viewIndex]);
                            break;
                        }
                    }
                }
            }
        }
        function removeModel(data, model) {
            if (!data) {
                return;
            }
            var length = data.length;
            var dataItem;
            var idx;
            for (idx = 0; idx < length; idx++) {
                dataItem = data[idx];
                if (dataItem.uid && dataItem.uid == model.uid) {
                    data.splice(idx, 1);
                    return dataItem;
                }
            }
        }
        function indexOfPristineModel(data, model) {
            if (model) {
                return indexOf(data, function (item) {
                    return item.uid && item.uid == model.uid || item[model.idField] === model.id && model.id !== model._defaultId;
                });
            }
            return -1;
        }
        function indexOfModel(data, model) {
            if (model) {
                return indexOf(data, function (item) {
                    return item.uid == model.uid;
                });
            }
            return -1;
        }
        function indexOf(data, comparer) {
            var idx, length;
            if (!data) {
                return;
            }
            for (idx = 0, length = data.length; idx < length; idx++) {
                if (comparer(data[idx])) {
                    return idx;
                }
            }
            return -1;
        }
        function fieldNameFromModel(fields, name) {
            if (fields && !isEmptyObject(fields)) {
                var descriptor = fields[name];
                var fieldName;
                if (isPlainObject(descriptor)) {
                    fieldName = descriptor.from || descriptor.field || name;
                } else {
                    fieldName = fields[name] || name;
                }
                if (isFunction(fieldName)) {
                    return name;
                }
                return fieldName;
            }
            return name;
        }
        function convertFilterDescriptorsField(descriptor, model) {
            var idx, length, target = {};
            for (var field in descriptor) {
                if (field !== 'filters') {
                    target[field] = descriptor[field];
                }
            }
            if (descriptor.filters) {
                target.filters = [];
                for (idx = 0, length = descriptor.filters.length; idx < length; idx++) {
                    target.filters[idx] = convertFilterDescriptorsField(descriptor.filters[idx], model);
                }
            } else {
                target.field = fieldNameFromModel(model.fields, target.field);
            }
            return target;
        }
        function convertDescriptorsField(descriptors, model) {
            var idx, length, result = [], target, descriptor;
            for (idx = 0, length = descriptors.length; idx < length; idx++) {
                target = {};
                descriptor = descriptors[idx];
                for (var field in descriptor) {
                    target[field] = descriptor[field];
                }
                target.field = fieldNameFromModel(model.fields, target.field);
                if (target.aggregates && isArray(target.aggregates)) {
                    target.aggregates = convertDescriptorsField(target.aggregates, model);
                }
                result.push(target);
            }
            return result;
        }
        var DataSource = Observable.extend({
            init: function (options) {
                var that = this, model, data;
                if (options) {
                    data = options.data;
                }
                options = that.options = extend({}, that.options, options);
                that._map = {};
                that._prefetch = {};
                that._data = [];
                that._pristineData = [];
                that._ranges = [];
                that._view = [];
                that._pristineTotal = 0;
                that._destroyed = [];
                that._pageSize = options.pageSize;
                that._page = options.page || (options.pageSize ? 1 : undefined);
                that._sort = normalizeSort(options.sort);
                that._sortFields = sortFields(options.sort);
                that._filter = normalizeFilter(options.filter);
                that._group = normalizeGroup(options.group);
                that._aggregate = options.aggregate;
                that._total = options.total;
                that._groupPaging = options.groupPaging;
                if (that._groupPaging) {
                    that._groupsState = {};
                }
                that._shouldDetachObservableParents = true;
                Observable.fn.init.call(that);
                that.transport = Transport.create(options, data, that);
                if (isFunction(that.transport.push)) {
                    that.transport.push({
                        pushCreate: proxy(that._pushCreate, that),
                        pushUpdate: proxy(that._pushUpdate, that),
                        pushDestroy: proxy(that._pushDestroy, that)
                    });
                }
                if (options.offlineStorage != null) {
                    if (typeof options.offlineStorage == 'string') {
                        var key = options.offlineStorage;
                        that._storage = {
                            getItem: function () {
                                return JSON.parse(localStorage.getItem(key));
                            },
                            setItem: function (item) {
                                localStorage.setItem(key, stringify(that.reader.serialize(item)));
                            }
                        };
                    } else {
                        that._storage = options.offlineStorage;
                    }
                }
                that.reader = new quilt.data.readers[options.schema.type || 'json'](options.schema);
                model = that.reader.model || {};
                that._detachObservableParents();
                that._data = that._observe(that._data);
                that._online = true;
                that.bind([
                    'push',
                    ERROR,
                    CHANGE,
                    REQUESTSTART,
                    SYNC,
                    REQUESTEND,
                    PROGRESS
                ], options);
            },
            options: {
                data: null,
                schema: { modelBase: Model },
                offlineStorage: null,
                serverSorting: false,
                serverPaging: false,
                serverFiltering: false,
                serverGrouping: false,
                serverAggregates: false,
                batch: false,
                inPlaceSort: false
            },
            clone: function () {
                return this;
            },
            online: function (value) {
                if (value !== undefined) {
                    if (this._online != value) {
                        this._online = value;
                        if (value) {
                            return this.sync();
                        }
                    }
                    return $.Deferred().resolve().promise();
                } else {
                    return this._online;
                }
            },
            offlineData: function (state) {
                if (this.options.offlineStorage == null) {
                    return null;
                }
                if (state !== undefined) {
                    return this._storage.setItem(state);
                }
                return this._storage.getItem() || [];
            },
            _isServerGrouped: function () {
                var group = this.group() || [];
                return this.options.serverGrouping && group.length;
            },
            _isServerGroupPaged: function () {
                return this._isServerGrouped() && this._groupPaging;
            },
            _isGroupPaged: function () {
                var group = this._group || [];
                return this._groupPaging && group.length;
            },
            _pushCreate: function (result) {
                this._push(result, 'pushCreate');
            },
            _pushUpdate: function (result) {
                this._push(result, 'pushUpdate');
            },
            _pushDestroy: function (result) {
                this._push(result, 'pushDestroy');
            },
            _push: function (result, operation) {
                var data = this._readData(result);
                if (!data) {
                    data = result;
                }
                this[operation](data);
            },
            _flatData: function (data, skip) {
                if (data) {
                    if (this._isServerGrouped()) {
                        return flattenGroups(data);
                    }
                    if (!skip) {
                        for (var idx = 0; idx < data.length; idx++) {
                            data.at(idx);
                        }
                    }
                }
                return data;
            },
            parent: noop,
            get: function (id) {
                var idx, length, data = this._flatData(this._data, this.options.useRanges);
                for (idx = 0, length = data.length; idx < length; idx++) {
                    if (data[idx].id == id) {
                        return data[idx];
                    }
                }
            },
            getByUid: function (id) {
                return this._getByUid(id, this._data);
            },
            _getByUid: function (id, dataItems) {
                var idx, length, data = this._flatData(dataItems, this.options.useRanges);
                if (!data) {
                    return;
                }
                for (idx = 0, length = data.length; idx < length; idx++) {
                    if (data[idx].uid == id) {
                        return data[idx];
                    }
                }
            },
            indexOf: function (model) {
                return indexOfModel(this._data, model);
            },
            at: function (index) {
                return this._data.at(index);
            },
            data: function (value) {
                var that = this;
                if (value !== undefined) {
                    that._detachObservableParents();
                    that._data = this._observe(value);
                    that._pristineData = value.slice(0);
                    that._storeData();
                    that._ranges = [];
                    that.trigger('reset');
                    that._addRange(that._data);
                    that._total = that._data.length;
                    that._pristineTotal = that._total;
                    that._process(that._data);
                } else {
                    if (that._data) {
                        for (var idx = 0; idx < that._data.length; idx++) {
                            that._data.at(idx);
                        }
                    }
                    return that._data;
                }
            },
            view: function (value) {
                if (value === undefined) {
                    return this._view;
                } else {
                    this._view = this._observeView(value);
                }
            },
            _observeView: function (data) {
                var that = this;
                replaceWithObservable(data, that._data, that._ranges, that.reader.model || ObservableObject, that._isServerGrouped());
                var view = new LazyObservableArray(data, that.reader.model);
                view.parent = function () {
                    return that.parent();
                };
                return view;
            },
            flatView: function () {
                var groups = this.group() || [];
                if (groups.length) {
                    return flattenGroups(this._view);
                } else {
                    return this._view;
                }
            },
            add: function (model) {
                return this.insert(this._data.length, model);
            },
            _createNewModel: function (model) {
                if (this.reader.model) {
                    return new this.reader.model(model);
                }
                if (model instanceof ObservableObject) {
                    return model;
                }
                return new ObservableObject(model);
            },
            insert: function (index, model) {
                if (!model) {
                    model = index;
                    index = 0;
                }
                if (!(model instanceof Model)) {
                    model = this._createNewModel(model);
                }
                if (this._isServerGrouped()) {
                    this._data.splice(index, 0, this._wrapInEmptyGroup(model));
                } else {
                    this._data.splice(index, 0, model);
                }
                this._insertModelInRange(index, model);
                return model;
            },
            pushInsert: function (index, items) {
                var that = this;
                var rangeSpan = that._getCurrentRangeSpan();
                if (!items) {
                    items = index;
                    index = 0;
                }
                if (!isArray(items)) {
                    items = [items];
                }
                var pushed = [];
                var autoSync = this.options.autoSync;
                this.options.autoSync = false;
                try {
                    for (var idx = 0; idx < items.length; idx++) {
                        var item = items[idx];
                        var result = this.insert(index, item);
                        pushed.push(result);
                        var pristine = result.toJSON();
                        if (this._isServerGrouped()) {
                            pristine = this._wrapInEmptyGroup(pristine);
                        }
                        this._pristineData.push(pristine);
                        if (rangeSpan && rangeSpan.length) {
                            $(rangeSpan).last()[0].pristineData.push(pristine);
                        }
                        index++;
                    }
                } finally {
                    this.options.autoSync = autoSync;
                }
                if (pushed.length) {
                    this.trigger('push', {
                        type: 'create',
                        items: pushed
                    });
                }
            },
            pushCreate: function (items) {
                this.pushInsert(this._data.length, items);
            },
            pushUpdate: function (items) {
                if (!isArray(items)) {
                    items = [items];
                }
                var pushed = [];
                for (var idx = 0; idx < items.length; idx++) {
                    var item = items[idx];
                    var model = this._createNewModel(item);
                    var target = this.get(model.id);
                    if (target) {
                        pushed.push(target);
                        target.accept(item);
                        target.trigger(CHANGE);
                        this._updatePristineForModel(target, item);
                    } else {
                        this.pushCreate(item);
                    }
                }
                if (pushed.length) {
                    this.trigger('push', {
                        type: 'update',
                        items: pushed
                    });
                }
            },
            pushDestroy: function (items) {
                var pushed = this._removeItems(items);
                if (pushed.length) {
                    this.trigger('push', {
                        type: 'destroy',
                        items: pushed
                    });
                }
            },
            _removeItems: function (items, removePristine) {
                if (!isArray(items)) {
                    items = [items];
                }
                var shouldRemovePristine = typeof removePristine !== 'undefined' ? removePristine : true;
                var destroyed = [];
                var autoSync = this.options.autoSync;
                this.options.autoSync = false;
                try {
                    for (var idx = 0; idx < items.length; idx++) {
                        var item = items[idx];
                        var model = this._createNewModel(item);
                        var found = false;
                        this._eachItem(this._data, function (items) {
                            for (var idx = 0; idx < items.length; idx++) {
                                var item = items.at(idx);
                                if (item.id === model.id) {
                                    destroyed.push(item);
                                    items.splice(idx, 1);
                                    found = true;
                                    break;
                                }
                            }
                        });
                        if (found && shouldRemovePristine) {
                            this._removePristineForModel(model);
                            this._destroyed.pop();
                        }
                    }
                } finally {
                    this.options.autoSync = autoSync;
                }
                return destroyed;
            },
            remove: function (model) {
                var result, that = this, hasGroups = that._isServerGrouped();
                this._eachItem(that._data, function (items) {
                    result = removeModel(items, model);
                    if (result && hasGroups) {
                        if (!result.isNew || !result.isNew()) {
                            that._destroyed.push(result);
                        }
                        return true;
                    }
                });
                this._removeModelFromRanges(model);
                return model;
            },
            destroyed: function () {
                return this._destroyed;
            },
            created: function () {
                var idx, length, result = [], data = this._flatData(this._data, this.options.useRanges);
                for (idx = 0, length = data.length; idx < length; idx++) {
                    if (data[idx].isNew && data[idx].isNew()) {
                        result.push(data[idx]);
                    }
                }
                return result;
            },
            updated: function () {
                var idx, length, result = [], data = this._flatData(this._data, this.options.useRanges);
                for (idx = 0, length = data.length; idx < length; idx++) {
                    if (data[idx].isNew && !data[idx].isNew() && data[idx].dirty) {
                        result.push(data[idx]);
                    }
                }
                return result;
            },
            sync: function () {
                var that = this, created = [], updated = [], destroyed = that._destroyed;
                var promise = $.Deferred().resolve().promise();
                if (that.online()) {
                    if (!that.reader.model) {
                        return promise;
                    }
                    created = that.created();
                    updated = that.updated();
                    var promises = [];
                    if (that.options.batch && that.transport.submit) {
                        promises = that._sendSubmit(created, updated, destroyed);
                    } else {
                        promises.push.apply(promises, that._send('create', created));
                        promises.push.apply(promises, that._send('update', updated));
                        promises.push.apply(promises, that._send('destroy', destroyed));
                    }
                    promise = $.when.apply(null, promises).then(function () {
                        var idx, length;
                        for (idx = 0, length = arguments.length; idx < length; idx++) {
                            if (arguments[idx]) {
                                that._accept(arguments[idx]);
                            }
                        }
                        that._storeData(true);
                        that._syncEnd();
                        that._change({ action: 'sync' });
                        that.trigger(SYNC);
                        if (that._isServerGroupPaged()) {
                            that.read();
                        }
                    });
                } else {
                    that._storeData(true);
                    that._syncEnd();
                    that._change({ action: 'sync' });
                }
                return promise;
            },
            _syncEnd: noop,
            cancelChanges: function (model) {
                var that = this;
                if (model instanceof quilt.data.Model) {
                    that._cancelModel(model);
                } else {
                    that._destroyed = [];
                    that._detachObservableParents();
                    that._data = that._observe(that._pristineData);
                    if (that.options.serverPaging) {
                        that._total = that._pristineTotal;
                    }
                    that._ranges = [];
                    that._addRange(that._data, 0);
                    that._changesCanceled();
                    that._change();
                    that._markOfflineUpdatesAsDirty();
                    if (that._isServerGrouped()) {
                        that.read();
                    }
                }
            },
            _changesCanceled: noop,
            _markOfflineUpdatesAsDirty: function () {
                var that = this;
                if (that.options.offlineStorage != null) {
                    that._eachItem(that._data, function (items) {
                        for (var idx = 0; idx < items.length; idx++) {
                            var item = items.at(idx);
                            if (item.__state__ == 'update' || item.__state__ == 'create') {
                                item.dirty = true;
                            }
                        }
                    });
                }
            },
            hasChanges: function () {
                var idx, length, data = this._flatData(this._data, this.options.useRanges);
                if (this._destroyed.length) {
                    return true;
                }
                for (idx = 0, length = data.length; idx < length; idx++) {
                    if (data[idx].isNew && data[idx].isNew() || data[idx].dirty) {
                        return true;
                    }
                }
                return false;
            },
            _accept: function (result) {
                var that = this, models = result.models, response = result.response, idx = 0, serverGroup = that._isServerGrouped(), pristine = that._pristineData, type = result.type, length;
                that.trigger(REQUESTEND, {
                    response: response,
                    type: type
                });
                if (response && !isEmptyObject(response)) {
                    response = that.reader.parse(response);
                    if (that._handleCustomErrors(response)) {
                        return;
                    }
                    response = that.reader.data(response);
                    if (!isArray(response)) {
                        response = [response];
                    }
                } else {
                    response = $.map(models, function (model) {
                        return model.toJSON();
                    });
                }
                if (type === 'destroy') {
                    that._destroyed = [];
                }
                for (idx = 0, length = models.length; idx < length; idx++) {
                    if (type !== 'destroy') {
                        models[idx].accept(response[idx]);
                        if (type === 'create') {
                            pristine.push(serverGroup ? that._wrapInEmptyGroup(models[idx].toJSON()) : response[idx]);
                        } else if (type === 'update') {
                            that._updatePristineForModel(models[idx], response[idx]);
                        }
                    } else {
                        that._removePristineForModel(models[idx]);
                    }
                }
            },
            _updatePristineForModel: function (model, values) {
                this._executeOnPristineForModel(model, function (index, items) {
                    quilt.deepExtend(items[index], values);
                });
            },
            _executeOnPristineForModel: function (model, callback) {
                this._eachPristineItem(function (items) {
                    var index = indexOfPristineModel(items, model);
                    if (index > -1) {
                        callback(index, items);
                        return true;
                    }
                });
            },
            _removePristineForModel: function (model) {
                this._executeOnPristineForModel(model, function (index, items) {
                    items.splice(index, 1);
                });
            },
            _readData: function (data) {
                var read = !this._isServerGrouped() ? this.reader.data : this.reader.groups;
                return read.call(this.reader, data);
            },
            _eachPristineItem: function (callback) {
                var that = this;
                var options = that.options;
                var rangeSpan = that._getCurrentRangeSpan();
                that._eachItem(that._pristineData, callback);
                if (options.serverPaging && options.useRanges) {
                    each(rangeSpan, function (i, range) {
                        that._eachItem(range.pristineData, callback);
                    });
                }
            },
            _eachItem: function (data, callback) {
                if (data && data.length) {
                    if (this._isServerGrouped()) {
                        eachGroupItems(data, callback);
                    } else {
                        callback(data);
                    }
                }
            },
            _pristineForModel: function (model) {
                var pristine, idx, callback = function (items) {
                        idx = indexOfPristineModel(items, model);
                        if (idx > -1) {
                            pristine = items[idx];
                            return true;
                        }
                    };
                this._eachPristineItem(callback);
                return pristine;
            },
            _cancelModel: function (model) {
                var that = this;
                var pristine = this._pristineForModel(model);
                this._eachItem(this._data, function (items) {
                    var idx = indexOfModel(items, model);
                    if (idx >= 0) {
                        if (pristine && (!model.isNew() || pristine.__state__)) {
                            items[idx].accept(pristine);
                            if (pristine.__state__ == 'update') {
                                items[idx].dirty = true;
                            }
                        } else {
                            that._modelCanceled(model);
                            items.splice(idx, 1);
                            that._removeModelFromRanges(model);
                        }
                    }
                });
            },
            _modelCanceled: noop,
            _submit: function (promises, data) {
                var that = this;
                that.trigger(REQUESTSTART, { type: 'submit' });
                that.trigger(PROGRESS);
                that.transport.submit(extend({
                    success: function (response, type) {
                        var promise = $.grep(promises, function (x) {
                            return x.type == type;
                        })[0];
                        if (promise) {
                            promise.resolve({
                                response: response,
                                models: promise.models,
                                type: type
                            });
                        }
                    },
                    error: function (response, status, error) {
                        for (var idx = 0; idx < promises.length; idx++) {
                            promises[idx].reject(response);
                        }
                        that.error(response, status, error);
                    }
                }, data));
            },
            _sendSubmit: function (created, updated, destroyed) {
                var that = this, promises = [];
                if (that.options.batch) {
                    if (created.length) {
                        promises.push($.Deferred(function (deferred) {
                            deferred.type = 'create';
                            deferred.models = created;
                        }));
                    }
                    if (updated.length) {
                        promises.push($.Deferred(function (deferred) {
                            deferred.type = 'update';
                            deferred.models = updated;
                        }));
                    }
                    if (destroyed.length) {
                        promises.push($.Deferred(function (deferred) {
                            deferred.type = 'destroy';
                            deferred.models = destroyed;
                        }));
                    }
                    that._submit(promises, {
                        data: {
                            created: that.reader.serialize(toJSON(created)),
                            updated: that.reader.serialize(toJSON(updated)),
                            destroyed: that.reader.serialize(toJSON(destroyed))
                        }
                    });
                }
                return promises;
            },
            _promise: function (data, models, type) {
                var that = this;
                return $.Deferred(function (deferred) {
                    that.trigger(REQUESTSTART, { type: type });
                    that.trigger(PROGRESS);
                    that.transport[type].call(that.transport, extend({
                        success: function (response) {
                            deferred.resolve({
                                response: response,
                                models: models,
                                type: type
                            });
                        },
                        error: function (response, status, error) {
                            deferred.reject(response);
                            that.error(response, status, error);
                        }
                    }, data));
                }).promise();
            },
            _send: function (method, data) {
                var that = this, idx, length, promises = [], converted = that.reader.serialize(toJSON(data));
                if (that.options.batch) {
                    if (data.length) {
                        promises.push(that._promise({ data: { models: converted } }, data, method));
                    }
                } else {
                    for (idx = 0, length = data.length; idx < length; idx++) {
                        promises.push(that._promise({ data: converted[idx] }, [data[idx]], method));
                    }
                }
                return promises;
            },
            read: function (data) {
                var that = this, params = that._params(data);
                var deferred = $.Deferred();
                that._queueRequest(params, function () {
                    var isPrevented = that.trigger(REQUESTSTART, { type: 'read' });
                    if (!isPrevented) {
                        that.trigger(PROGRESS);
                        that._ranges = [];
                        that.trigger('reset');
                        if (that.online()) {
                            that.transport.read({
                                data: params,
                                success: function (data) {
                                    that._ranges = [];
                                    that.success(data, params);
                                    deferred.resolve();
                                },
                                error: function () {
                                    var args = slice.call(arguments);
                                    that.error.apply(that, args);
                                    deferred.reject.apply(deferred, args);
                                }
                            });
                        } else if (that.options.offlineStorage != null) {
                            that.success(that.offlineData(), params);
                            deferred.resolve();
                        }
                    } else {
                        that._dequeueRequest();
                        deferred.resolve(isPrevented);
                    }
                });
                return deferred.promise();
            },
            _readAggregates: function (data) {
                return this.reader.aggregates(data);
            },
            success: function (data) {
                var that = this, options = that.options, items, replaceSubset;
                that.trigger(REQUESTEND, {
                    response: data,
                    type: 'read'
                });
                if (that.online()) {
                    data = that.reader.parse(data);
                    if (that._handleCustomErrors(data)) {
                        that._dequeueRequest();
                        return;
                    }
                    that._total = that.reader.total(data);
                    if (that._isServerGroupPaged()) {
                        that._serverGroupsTotal = that._total;
                    }
                    if (that._pageSize > that._total) {
                        that._pageSize = that._total;
                        if (that.options.pageSize && that.options.pageSize > that._pageSize) {
                            that._pageSize = that.options.pageSize;
                        }
                    }
                    if (that._aggregate && options.serverAggregates) {
                        that._aggregateResult = that._readAggregates(data);
                    }
                    data = that._readData(data);
                    that._destroyed = [];
                } else {
                    data = that._readData(data);
                    items = [];
                    var itemIds = {};
                    var model = that.reader.model;
                    var idField = model ? model.idField : 'id';
                    var idx;
                    for (idx = 0; idx < this._destroyed.length; idx++) {
                        var id = this._destroyed[idx][idField];
                        itemIds[id] = id;
                    }
                    for (idx = 0; idx < data.length; idx++) {
                        var item = data[idx];
                        var state = item.__state__;
                        if (state == 'destroy') {
                            if (!itemIds[item[idField]]) {
                                this._destroyed.push(this._createNewModel(item));
                            }
                        } else {
                            items.push(item);
                        }
                    }
                    data = items;
                    that._total = data.length;
                }
                that._pristineTotal = that._total;
                replaceSubset = that._skip && that._data.length && that._skip < that._data.length;
                if (that.options.endless) {
                    if (replaceSubset) {
                        that._pristineData.splice(that._skip, that._pristineData.length);
                    }
                    items = data.slice(0);
                    for (var j = 0; j < items.length; j++) {
                        that._pristineData.push(items[j]);
                    }
                } else {
                    that._pristineData = data.slice(0);
                }
                that._detachObservableParents();
                if (that.options.endless) {
                    that._data.unbind(CHANGE, that._changeHandler);
                    if (that._isServerGrouped() && that._data[that._data.length - 1].value === data[0].value) {
                        fillLastGroup(that._data[that._data.length - 1], data[0]);
                        data.shift();
                    }
                    data = that._observe(data);
                    if (replaceSubset) {
                        that._data.splice(that._skip, that._data.length);
                    }
                    for (var i = 0; i < data.length; i++) {
                        that._data.push(data[i]);
                    }
                    that._data.bind(CHANGE, that._changeHandler);
                } else {
                    that._data = that._observe(data);
                }
                that._markOfflineUpdatesAsDirty();
                that._storeData();
                that._addRange(that._data);
                that._process(that._data);
                that._dequeueRequest();
            },
            _detachObservableParents: function () {
                if (this._data && this._shouldDetachObservableParents) {
                    for (var idx = 0; idx < this._data.length; idx++) {
                        if (this._data[idx].parent) {
                            this._data[idx].parent = noop;
                        }
                    }
                }
            },
            _storeData: function (updatePristine) {
                var serverGrouping = this._isServerGrouped();
                var model = this.reader.model;
                function items(data) {
                    var state = [];
                    for (var idx = 0; idx < data.length; idx++) {
                        var dataItem = data.at(idx);
                        var item = dataItem.toJSON();
                        if (serverGrouping && dataItem.items) {
                            item.items = items(dataItem.items);
                        } else {
                            item.uid = dataItem.uid;
                            if (model) {
                                if (dataItem.isNew()) {
                                    item.__state__ = 'create';
                                } else if (dataItem.dirty) {
                                    item.__state__ = 'update';
                                }
                            }
                        }
                        state.push(item);
                    }
                    return state;
                }
                if (this.options.offlineStorage != null) {
                    var state = items(this._data);
                    var destroyed = [];
                    for (var idx = 0; idx < this._destroyed.length; idx++) {
                        var item = this._destroyed[idx].toJSON();
                        item.__state__ = 'destroy';
                        destroyed.push(item);
                    }
                    this.offlineData(state.concat(destroyed));
                    if (updatePristine) {
                        this._pristineData = this.reader.reader ? this.reader.reader._wrapDataAccessBase(state) : this.reader._wrapDataAccessBase(state);
                    }
                }
            },
            _addRange: function (data, skip) {
                var that = this, start = typeof skip !== 'undefined' ? skip : that._skip || 0, end, range = {
                        data: data,
                        pristineData: data.toJSON(),
                        timestamp: that._timeStamp()
                    };
                if (this._isGroupPaged()) {
                    end = start + data.length;
                    range.outerStart = start;
                    range.outerEnd = end;
                } else {
                    end = start + that._flatData(data, true).length;
                }
                range.start = start;
                range.end = end;
                that._ranges.push(range);
                that._sortRanges();
                if (that._isGroupPaged()) {
                    if (!that._groupsFlat) {
                        that._groupsFlat = [];
                    }
                    that._appendToGroupsFlat(range.data);
                    that._updateOuterRangesLength();
                }
            },
            _appendToGroupsFlat: function (data) {
                var length = data.length;
                for (var i = 0; i < length; i++) {
                    this._groupsFlat.push(data[i]);
                }
            },
            _getGroupByUid: function (uid) {
                var length = this._groupsFlat.length;
                var group;
                for (var i = 0; i < length; i++) {
                    group = this._groupsFlat[i];
                    if (group.uid === uid) {
                        return group;
                    }
                }
            },
            _sortRanges: function () {
                this._ranges.sort(function (x, y) {
                    return x.start - y.start;
                });
            },
            error: function (xhr, status, errorThrown) {
                this._dequeueRequest();
                this.trigger(REQUESTEND, {});
                this.trigger(ERROR, {
                    xhr: xhr,
                    status: status,
                    errorThrown: errorThrown
                });
            },
            _params: function (data) {
                var that = this, options = extend({
                        take: that.take(),
                        skip: that.skip(),
                        page: that.page(),
                        pageSize: that.pageSize(),
                        sort: that._sort,
                        filter: that._filter,
                        group: that._group,
                        aggregate: that._aggregate,
                        groupPaging: !!that._groupPaging
                    }, data);
                if (!that.options.serverPaging) {
                    delete options.take;
                    delete options.skip;
                    delete options.page;
                    delete options.pageSize;
                }
                if (!that.options.serverGrouping) {
                    delete options.group;
                } else if (that.reader.model && options.group) {
                    options.group = convertDescriptorsField(options.group, that.reader.model);
                }
                if (!that.options.serverFiltering) {
                    delete options.filter;
                } else if (that.reader.model && options.filter) {
                    options.filter = convertFilterDescriptorsField(options.filter, that.reader.model);
                }
                if (!that.options.serverSorting) {
                    delete options.sort;
                } else if (that.reader.model && options.sort) {
                    options.sort = convertDescriptorsField(options.sort, that.reader.model);
                }
                if (!that.options.serverAggregates) {
                    delete options.aggregate;
                } else if (that.reader.model && options.aggregate) {
                    options.aggregate = convertDescriptorsField(options.aggregate, that.reader.model);
                }
                if (!that.options.groupPaging) {
                    delete options.groupPaging;
                }
                return options;
            },
            _queueRequest: function (options, callback) {
                var that = this;
                if (!that._requestInProgress) {
                    that._requestInProgress = true;
                    that._pending = undefined;
                    callback();
                } else {
                    that._pending = {
                        callback: proxy(callback, that),
                        options: options
                    };
                }
            },
            _dequeueRequest: function () {
                var that = this;
                that._requestInProgress = false;
                if (that._pending) {
                    that._queueRequest(that._pending.options, that._pending.callback);
                }
            },
            _handleCustomErrors: function (response) {
                if (this.reader.errors) {
                    var errors = this.reader.errors(response);
                    if (errors) {
                        this.trigger(ERROR, {
                            xhr: null,
                            status: 'customerror',
                            errorThrown: 'custom error',
                            errors: errors
                        });
                        return true;
                    }
                }
                return false;
            },
            _shouldWrap: function (data) {
                var model = this.reader.model;
                if (model && data.length) {
                    return !(data[0] instanceof model);
                }
                return false;
            },
            _observe: function (data) {
                var that = this, model = that.reader.model;
                that._shouldDetachObservableParents = true;
                if (data instanceof ObservableArray) {
                    that._shouldDetachObservableParents = false;
                    if (that._shouldWrap(data)) {
                        data.type = that.reader.model;
                        data.wrapAll(data, data);
                    }
                } else {
                    var arrayType = that.pageSize() && !that.options.serverPaging ? LazyObservableArray : ObservableArray;
                    data = new arrayType(data, that.reader.model);
                    data.parent = function () {
                        return that.parent();
                    };
                }
                if (that._isServerGrouped()) {
                    wrapGroupItems(data, model);
                }
                if (that._changeHandler && that._data && that._data instanceof ObservableArray && !(that.options.useRanges && that.options.serverPaging)) {
                    that._data.unbind(CHANGE, that._changeHandler);
                } else {
                    that._changeHandler = proxy(that._change, that);
                }
                return data.bind(CHANGE, that._changeHandler);
            },
            _updateTotalForAction: function (action, items) {
                var that = this;
                var total = parseInt(that._total, 10);
                if (!isNumber(that._total)) {
                    total = parseInt(that._pristineTotal, 10);
                }
                if (action === 'add') {
                    total += items.length;
                } else if (action === 'remove') {
                    total -= items.length;
                } else if (action !== 'itemchange' && action !== 'sync' && !that.options.serverPaging) {
                    total = that._pristineTotal;
                } else if (action === 'sync') {
                    total = that._pristineTotal = parseInt(that._total, 10);
                }
                that._total = total;
            },
            _change: function (e) {
                var that = this, idx, length, action = e ? e.action : '';
                if (action === 'remove') {
                    for (idx = 0, length = e.items.length; idx < length; idx++) {
                        if (!e.items[idx].isNew || !e.items[idx].isNew()) {
                            that._destroyed.push(e.items[idx]);
                        }
                    }
                }
                if (that.options.autoSync && (action === 'add' || action === 'remove' || action === 'itemchange')) {
                    var handler = function (args) {
                        if (args.action === 'sync') {
                            that.unbind('change', handler);
                            that._updateTotalForAction(action, e.items);
                        }
                    };
                    that.first('change', handler);
                    that.sync();
                } else {
                    that._updateTotalForAction(action, e ? e.items : []);
                    that._process(that._data, e);
                }
            },
            _calculateAggregates: function (data, options) {
                options = options || {};
                var query = new Query(data), aggregates = options.aggregate, filter = options.filter;
                if (filter) {
                    query = query.filter(filter);
                }
                return query.aggregate(aggregates);
            },
            _process: function (data, e) {
                var that = this, options = {}, result;
                if (that.options.serverPaging !== true) {
                    options.skip = that._skip;
                    options.take = that._take || that._pageSize;
                    if (options.skip === undefined && that._page !== undefined && that._pageSize !== undefined) {
                        options.skip = (that._page - 1) * that._pageSize;
                    }
                    if (that.options.useRanges) {
                        options.skip = that.currentRangeStart();
                    }
                }
                if (that.options.serverSorting !== true) {
                    options.sort = that._sort;
                }
                if (that.options.serverFiltering !== true) {
                    options.filter = that._filter;
                }
                if (that.options.serverGrouping !== true) {
                    options.group = that._group;
                }
                if (that.options.serverAggregates !== true) {
                    options.aggregate = that._aggregate;
                }
                if (that.options.serverGrouping) {
                    that._clearEmptyGroups(data);
                }
                options.groupPaging = that._groupPaging;
                if (that._isGroupPaged() && e && (e.action === 'page' || e.action === 'expandGroup' || e.action === 'collapseGroup')) {
                    result = that._queryProcess(data, { aggregate: that._aggregate });
                } else {
                    result = that._queryProcess(data, options);
                }
                if (that.options.serverAggregates !== true) {
                    that._aggregateResult = that._calculateAggregates(result.dataToAggregate || data, options);
                }
                that._setView(result, options, e);
                that._setFilterTotal(result.total, false);
                e = e || {};
                e.items = e.items || that._view;
                that.trigger(CHANGE, e);
            },
            _setView: function (result, options, e) {
                var that = this;
                if (that._isGroupPaged() && !that._isServerGrouped()) {
                    if (e && (e.action === 'page' || e.action === 'expandGroup' || e.action === 'collapseGroup')) {
                        that.view(result.data);
                        that._updateOuterRangesLength();
                    } else {
                        that._ranges = [];
                        var query = new Query(result.data);
                        that._addRange(that._observe(result.data));
                        if (options.skip + options.take > result.data.length) {
                            options.skip = result.data.length - options.take;
                        }
                        that.view(query.range(options.skip, options.take).toArray());
                    }
                } else {
                    that.view(result.data);
                }
            },
            _clearEmptyGroups: function (data) {
                for (var idx = data.length - 1; idx >= 0; idx--) {
                    var group = data[idx];
                    if (group.hasSubgroups) {
                        this._clearEmptyGroups(group.items);
                    } else {
                        if (group.items && !group.items.length) {
                            splice.apply(group.parent(), [
                                idx,
                                1
                            ]);
                        }
                    }
                }
            },
            _queryProcess: function (data, options) {
                if (this.options.inPlaceSort) {
                    return Query.process(data, options, this.options.inPlaceSort);
                } else {
                    return Query.process(data, options);
                }
            },
            _mergeState: function (options) {
                var that = this;
                if (options !== undefined) {
                    that._pageSize = options.pageSize;
                    that._page = options.page;
                    that._sort = options.sort;
                    that._filter = options.filter;
                    that._group = options.group;
                    that._aggregate = options.aggregate;
                    that._skip = that._currentRangeStart = options.skip;
                    that._take = options.take;
                    if (that._skip === undefined) {
                        that._skip = that._currentRangeStart = that.skip();
                        options.skip = that.skip();
                    }
                    if (that._take === undefined && that._pageSize !== undefined) {
                        that._take = that._pageSize;
                        options.take = that._take;
                    }
                    if (options.sort) {
                        that._sort = options.sort = normalizeSort(options.sort);
                        that._sortFields = sortFields(options.sort);
                    }
                    if (options.filter) {
                        that._filter = options.filter = that.options.accentFoldingFiltering && !$.isEmptyObject(options.filter) ? $.extend({}, normalizeFilter(options.filter), { accentFoldingFiltering: that.options.accentFoldingFiltering }) : normalizeFilter(options.filter);
                    }
                    if (options.group) {
                        that._group = options.group = normalizeGroup(options.group);
                    }
                    if (options.aggregate) {
                        that._aggregate = options.aggregate = normalizeAggregate(options.aggregate);
                    }
                }
                return options;
            },
            query: function (options) {
                var result;
                var remote = this.options.serverSorting || this.options.serverPaging || this.options.serverFiltering || this.options.serverGrouping || this.options.serverAggregates;
                if (remote || (this._data === undefined || this._data.length === 0) && !this._destroyed.length) {
                    if (this.options.endless) {
                        var moreItemsCount = options.pageSize - this.pageSize();
                        if (moreItemsCount > 0) {
                            moreItemsCount = this.pageSize();
                            options.page = options.pageSize / moreItemsCount;
                            options.pageSize = moreItemsCount;
                        } else {
                            options.page = 1;
                            this.options.endless = false;
                        }
                    }
                    return this.read(this._mergeState(options));
                }
                var isPrevented = this.trigger(REQUESTSTART, { type: 'read' });
                if (!isPrevented) {
                    this.trigger(PROGRESS);
                    if (options) {
                        options.groupPaging = this._groupPaging;
                    }
                    result = this._queryProcess(this._data, this._mergeState(options));
                    this._setFilterTotal(result.total, true);
                    this._aggregateResult = this._calculateAggregates(result.dataToAggregate || this._data, options);
                    this._setView(result, options);
                    this.trigger(REQUESTEND, { type: 'read' });
                    this.trigger(CHANGE, {
                        items: result.data,
                        action: options ? options.action : ''
                    });
                }
                return $.Deferred().resolve(isPrevented).promise();
            },
            _hasExpandedSubGroups: function (group) {
                var result = false;
                var length = group.items ? group.items.length : 0;
                if (!group.hasSubgroups) {
                    return false;
                }
                for (var i = 0; i < length; i++) {
                    if (this._groupsState[group.items[i].uid]) {
                        result = true;
                        break;
                    }
                }
                return result;
            },
            _findGroupedRange: function (data, result, options, parents, callback) {
                var that = this;
                var length = data.length;
                var group;
                var current;
                var itemsLength;
                var groupCount;
                var itemsToSkip;
                for (var i = 0; i < length; i++) {
                    group = data[i];
                    if (options.taken >= options.take) {
                        break;
                    }
                    if (!that._getGroupByUid(group.uid)) {
                        that._groupsFlat.push(group);
                    }
                    if (that._groupsState[group.uid]) {
                        if (that._isServerGroupPaged()) {
                            if (that._fetchGroupItems(group, options, parents, callback)) {
                                that._fetchingGroupItems = true;
                                return;
                            }
                            groupCount = (group.subgroupCount || group.itemCount) + 1;
                            itemsToSkip = options.skip - options.skipped;
                            if (!that._hasExpandedSubGroups(group) && itemsToSkip > groupCount) {
                                options.skipped += groupCount;
                                continue;
                            }
                        }
                        if (options.includeParents && options.skipped < options.skip) {
                            options.skipped++;
                            group.excludeHeader = true;
                        } else if (options.includeParents) {
                            options.taken++;
                            group.excludeHeader = false;
                        }
                        if (group.hasSubgroups && group.items && group.items.length) {
                            group.currentItems = [];
                            if (!parents) {
                                parents = [];
                            }
                            parents.push(group);
                            that._findGroupedRange(group.items, group.currentItems, options, parents, callback);
                            parents.pop();
                            if (group.currentItems.length || options.taken > 0) {
                                result.push(group);
                            } else {
                                group.excludeHeader = false;
                            }
                        } else {
                            current = [];
                            itemsLength = group.items.length;
                            for (var j = 0; j < itemsLength; j++) {
                                if (options.skipped < options.skip) {
                                    options.skipped++;
                                    continue;
                                }
                                if (options.taken >= options.take) {
                                    break;
                                }
                                current.push(group.items[j]);
                                options.taken++;
                            }
                            if (current.length || options.taken > 0) {
                                group.currentItems = current;
                                result.push(group);
                            } else {
                                group.excludeHeader = false;
                            }
                        }
                    } else {
                        if (options.skipped < options.skip) {
                            options.skipped++;
                            continue;
                        }
                        result.push(group);
                        options.taken++;
                    }
                }
            },
            _expandedSubGroupItemsCount: function (group, end, includeCurrentItems) {
                var that = this;
                var result = 0;
                var subGroup;
                var endSpecified = typeof end === 'number';
                var length = endSpecified ? end : group.subgroupCount;
                var temp;
                if (!group.hasSubgroups) {
                    return result;
                }
                for (var i = 0; i < length; i++) {
                    subGroup = group.items[i];
                    if (!subGroup) {
                        break;
                    }
                    if (subGroup.hasSubgroups && that._groupsState[group.uid]) {
                        temp = that._expandedSubGroupItemsCount(subGroup, length, true);
                        result += temp;
                        if (endSpecified) {
                            length -= temp;
                        }
                    } else if (!subGroup.hasSubgroups && that._groupsState[subGroup.uid]) {
                        temp = subGroup.items ? subGroup.items.length : 0;
                        result += temp;
                        if (endSpecified) {
                            length -= temp;
                        }
                    }
                    if (includeCurrentItems) {
                        result += 1;
                        if (endSpecified) {
                            length -= 1;
                        }
                    }
                    if (endSpecified && result > length) {
                        return result;
                    }
                }
                return result;
            },
            _fetchGroupItems: function (group, options, parents, callback) {
                var that = this;
                var groupItemsSkip;
                var firstItem;
                var lastItem;
                var groupItemCount = group.hasSubgroups ? group.subgroupCount : group.itemCount;
                var take = options.take;
                var skipped = options.skipped;
                var pageSize = that.take();
                var expandedSubGroupItemsCount;
                if (options.includeParents) {
                    if (skipped < options.skip) {
                        skipped += 1;
                    } else {
                        take -= 1;
                    }
                }
                if (!group.items || group.items && !group.items.length) {
                    that.getGroupItems(group, options, parents, callback, 0);
                    return true;
                } else {
                    expandedSubGroupItemsCount = this._expandedSubGroupItemsCount(group, options.skip - skipped);
                    groupItemsSkip = Math.max(options.skip - (skipped + expandedSubGroupItemsCount), 0);
                    if (groupItemsSkip >= groupItemCount) {
                        return false;
                    }
                    firstItem = group.items[groupItemsSkip];
                    lastItem = group.items[Math.min(groupItemsSkip + take, groupItemCount - 1)];
                    if (firstItem.notFetched) {
                        that.getGroupItems(group, options, parents, callback, math.max(math.floor(groupItemsSkip / pageSize), 0) * pageSize);
                        return true;
                    }
                    if (lastItem.notFetched) {
                        that.getGroupItems(group, options, parents, callback, math.max(math.floor((groupItemsSkip + pageSize) / pageSize), 0) * pageSize);
                        return true;
                    }
                }
            },
            getGroupItems: function (group, options, parents, callback, groupItemsSkip) {
                var that = this;
                var take;
                var filter;
                var data;
                var subgroups;
                if (!group.items) {
                    group.items = [];
                }
                take = that.take();
                filter = this._composeItemsFilter(group, parents);
                data = {
                    page: math.floor((groupItemsSkip || 0) / (take || 1)) || 1,
                    pageSize: take,
                    skip: groupItemsSkip,
                    take: take,
                    filter: filter,
                    aggregate: that._aggregate,
                    sort: that._sort
                };
                subgroups = that.findSubgroups(group);
                if (subgroups && subgroups.length) {
                    data.group = subgroups;
                    data.groupPaging = true;
                }
                clearTimeout(that._timeout);
                that._timeout = setTimeout(function () {
                    that._queueRequest(data, function () {
                        if (!that.trigger(REQUESTSTART, { type: 'read' })) {
                            that.transport.read({
                                data: data,
                                success: that._groupItemsSuccessHandler(group, options.skip, that.take(), callback, groupItemsSkip),
                                error: function () {
                                    var args = slice.call(arguments);
                                    that.error.apply(that, args);
                                }
                            });
                        } else {
                            that._dequeueRequest();
                        }
                    });
                }, 100);
            },
            _groupItemsSuccessHandler: function (group, skip, take, callback, groupItemsSkip) {
                var that = this;
                var timestamp = that._timeStamp();
                callback = isFunction(callback) ? callback : noop;
                var totalField = that.options.schema && that.options.schema.total ? that.options.schema.total : 'Total';
                return function (data) {
                    var temp;
                    var model = Model.define(that.options.schema.model);
                    var totalCount;
                    that._dequeueRequest();
                    that.trigger(REQUESTEND, {
                        response: data,
                        type: 'read'
                    });
                    if (isFunction(totalField)) {
                        totalCount = totalField(data);
                    } else {
                        totalCount = data[totalField];
                    }
                    data = that.reader.parse(data);
                    if (group.hasSubgroups) {
                        temp = that.reader.groups(data);
                        group.subgroupCount = totalCount;
                    } else {
                        temp = that.reader.data(data);
                        temp = temp.map(function (item) {
                            return new model(item);
                        });
                    }
                    group.items.omitChangeEvent = true;
                    for (var i = 0; i < totalCount; i++) {
                        if (i >= groupItemsSkip && i < groupItemsSkip + take) {
                            group.items.splice(i, 1, temp[i - groupItemsSkip]);
                        } else {
                            if (!group.items[i]) {
                                group.items.splice(i, 0, { notFetched: true });
                            }
                        }
                    }
                    group.items.omitChangeEvent = false;
                    that._updateRangePristineData(group);
                    that._fetchingGroupItems = false;
                    if (!group.countAdded) {
                        that._serverGroupsTotal += totalCount;
                        group.countAdded = true;
                    }
                    that.range(skip, take, callback, 'expandGroup');
                    if (timestamp >= that._currentRequestTimeStamp || !that._skipRequestsInProgress) {
                        that.trigger(CHANGE, {});
                    }
                };
            },
            findSubgroups: function (group) {
                var indexOfCurrentGroup = this._group.map(function (g) {
                    return g.field;
                }).indexOf(group.field);
                return this._group.slice(indexOfCurrentGroup + 1, this._group.length);
            },
            _composeItemsFilter: function (group, parents) {
                var filter = this.filter() || {
                    logic: 'and',
                    filters: []
                };
                filter = extend(true, {}, filter);
                filter.filters.push({
                    field: group.field,
                    operator: 'eq',
                    value: group.value
                });
                if (parents) {
                    for (var i = 0; i < parents.length; i++) {
                        filter.filters.push({
                            field: parents[i].field,
                            operator: 'eq',
                            value: parents[i].value
                        });
                    }
                }
                return filter;
            },
            _updateRangePristineData: function (group) {
                var that = this;
                var ranges = that._ranges;
                var rangesLength = ranges.length;
                var temp;
                var currentGroup;
                var range;
                var dataLength;
                var indexes;
                var currIdx;
                for (var i = 0; i < rangesLength; i++) {
                    range = ranges[i];
                    dataLength = range.data.length;
                    indexes = [];
                    temp = null;
                    for (var j = 0; j < dataLength; j++) {
                        currentGroup = range.data[j];
                        indexes.push(j);
                        if (currentGroup.uid === group.uid || currentGroup.hasSubgroups && currentGroup.items.length && that._containsSubGroup(currentGroup, group, indexes)) {
                            break;
                        }
                        indexes.pop();
                    }
                    if (indexes.length) {
                        temp = ranges[i].pristineData;
                        while (indexes.length > 1) {
                            currIdx = indexes.splice(0, 1)[0];
                            temp = temp[currIdx].items;
                        }
                        temp[indexes[0]] = that._cloneGroup(group);
                        break;
                    }
                }
            },
            _containsSubGroup: function (group, subgroup, indexes) {
                var that = this;
                var length = group.items.length;
                var currentSubGroup;
                if (group.hasSubgroups && length) {
                    for (var i = 0; i < length; i++) {
                        currentSubGroup = group.items[i];
                        indexes.push(i);
                        if (currentSubGroup.uid === subgroup.uid) {
                            return true;
                        } else if (currentSubGroup.hasSubgroups && currentSubGroup.items.length) {
                            return that._containsSubGroup(currentSubGroup, subgroup, indexes);
                        }
                        indexes.pop();
                    }
                }
            },
            _cloneGroup: function (group) {
                var that = this;
                group = typeof group.toJSON == 'function' ? group.toJSON() : group;
                if (group.items && group.items.length) {
                    group.items = group.items.map(function (item) {
                        return that._cloneGroup(item);
                    });
                }
                return group;
            },
            _setFilterTotal: function (filterTotal, setDefaultValue) {
                var that = this;
                if (!that.options.serverFiltering) {
                    if (filterTotal !== undefined) {
                        that._total = filterTotal;
                    } else if (setDefaultValue) {
                        that._total = that._data.length;
                    }
                }
            },
            fetch: function (callback) {
                var that = this;
                var fn = function (isPrevented) {
                    if (isPrevented !== true && isFunction(callback)) {
                        callback.call(that);
                    }
                };
                return this._query().done(fn);
            },
            _query: function (options) {
                var that = this;
                return that.query(extend({}, {
                    page: that.page(),
                    pageSize: that.pageSize(),
                    sort: that.sort(),
                    filter: that.filter(),
                    group: that.group(),
                    aggregate: that.aggregate()
                }, options));
            },
            next: function (options) {
                var that = this, page = that.page(), total = that.total();
                options = options || {};
                if (!page || total && page + 1 > that.totalPages()) {
                    return;
                }
                that._skip = that._currentRangeStart = page * that.take();
                page += 1;
                options.page = page;
                that._query(options);
                return page;
            },
            prev: function (options) {
                var that = this, page = that.page();
                options = options || {};
                if (!page || page === 1) {
                    return;
                }
                that._skip = that._currentRangeStart = that._skip - that.take();
                page -= 1;
                options.page = page;
                that._query(options);
                return page;
            },
            page: function (val) {
                var that = this, skip;
                if (val !== undefined) {
                    val = math.max(math.min(math.max(val, 1), that.totalPages()), 1);
                    var take = that.take();
                    if (that._isGroupPaged()) {
                        val -= 1;
                        that.range(val * take, take, null, 'page');
                        return;
                    }
                    that._query(that._pageableQueryOptions({ page: val }));
                    return;
                }
                skip = that.skip();
                return skip !== undefined ? math.round((skip || 0) / (that.take() || 1)) + 1 : undefined;
            },
            pageSize: function (val) {
                var that = this;
                if (val !== undefined) {
                    that._query(that._pageableQueryOptions({
                        pageSize: val,
                        page: 1
                    }));
                    return;
                }
                return that.take();
            },
            sort: function (val) {
                var that = this;
                if (val !== undefined) {
                    that.trigger('sort');
                    that._query({ sort: val });
                    return;
                }
                return that._sort;
            },
            filter: function (val) {
                var that = this;
                if (val === undefined) {
                    return that._filter;
                }
                that.trigger('reset');
                that._query({
                    filter: val,
                    page: 1
                });
            },
            group: function (val) {
                var that = this;
                var options = { group: val };
                if (that._groupPaging) {
                    options.page = 1;
                }
                if (val !== undefined) {
                    that._query(options);
                    return;
                }
                return that._group;
            },
            getGroupsFlat: function (data) {
                var idx, result = [], length;
                for (idx = 0, length = data.length; idx < length; idx++) {
                    var group = data[idx];
                    if (group.hasSubgroups) {
                        result = result.concat(this.getGroupsFlat(group.items));
                    }
                    result.push(group);
                }
                return result;
            },
            total: function () {
                return parseInt(this._total || 0, 10);
            },
            groupsTotal: function (includeExpanded) {
                var that = this;
                if (!that._group.length) {
                    return that.total();
                }
                if (that._isServerGrouped()) {
                    if (that._serverGroupsTotal) {
                        return that._serverGroupsTotal;
                    }
                    that._serverGroupsTotal = that.total();
                    return that._serverGroupsTotal;
                }
                return that._calculateGroupsTotal(that._ranges.length ? that._ranges[0].data : [], includeExpanded);
            },
            _calculateGroupsTotal: function (groups, includeExpanded, itemsField, ignoreState) {
                var that = this;
                itemsField = itemsField || 'items';
                var total;
                var length;
                if (that._group.length && groups) {
                    total = 0;
                    length = groups.length;
                    for (var i = 0; i < length; i++) {
                        total += that.groupCount(groups[i], includeExpanded, itemsField, ignoreState);
                    }
                    that._groupsTotal = total;
                    return total;
                }
                that._groupsTotal = that._data.length;
                return that._groupsTotal;
            },
            groupCount: function (group, includeExpanded, itemsField, ignoreState) {
                var that = this;
                var total = 0;
                if (group.hasSubgroups && that._groupsState[group.uid]) {
                    if (includeExpanded && !group.excludeHeader || ignoreState) {
                        total += 1;
                    }
                    group[itemsField].forEach(function (subgroup) {
                        total += that.groupCount(subgroup, includeExpanded, itemsField, ignoreState);
                    });
                } else {
                    if (that._groupsState[group.uid]) {
                        if (includeExpanded && !group.excludeHeader || ignoreState) {
                            total++;
                        }
                        total += group[itemsField] ? group[itemsField].length : 0;
                    } else {
                        total++;
                    }
                }
                return total;
            },
            countGroupRange: function (range) {
                var total = 0;
                var length = range.length;
                for (var i = 0; i < length; i++) {
                    total += this.groupCount(range[i], true);
                }
                return total;
            },
            aggregate: function (val) {
                var that = this;
                if (val !== undefined) {
                    that._query({ aggregate: val });
                    return;
                }
                return that._aggregate;
            },
            aggregates: function () {
                var result = this._aggregateResult;
                if (isEmptyObject(result)) {
                    result = this._emptyAggregates(this.aggregate());
                }
                return result;
            },
            _emptyAggregates: function (aggregates) {
                var result = {};
                if (!isEmptyObject(aggregates)) {
                    var aggregate = {};
                    if (!isArray(aggregates)) {
                        aggregates = [aggregates];
                    }
                    for (var idx = 0; idx < aggregates.length; idx++) {
                        aggregate[aggregates[idx].aggregate] = 0;
                        result[aggregates[idx].field] = aggregate;
                    }
                }
                return result;
            },
            _pageableQueryOptions: function (options) {
                return options;
            },
            _wrapInEmptyGroup: function (model) {
                var groups = this.group(), parent, group, idx, length;
                for (idx = groups.length - 1, length = 0; idx >= length; idx--) {
                    group = groups[idx];
                    parent = {
                        value: model.get ? model.get(group.field) : model[group.field],
                        field: group.field,
                        items: parent ? [parent] : [model],
                        hasSubgroups: !!parent,
                        aggregates: this._emptyAggregates(group.aggregates)
                    };
                }
                return parent;
            },
            totalPages: function () {
                var that = this, pageSize = that.pageSize() || that.total(), total = that._isGroupPaged() ? that.groupsTotal(true) : that.total();
                return math.ceil((total || 0) / pageSize);
            },
            inRange: function (skip, take) {
                var that = this, end = math.min(skip + take, that.total());
                if (!that.options.serverPaging && that._data.length > 0) {
                    return true;
                }
                return that._findRange(skip, end).length > 0;
            },
            lastRange: function () {
                var ranges = this._ranges;
                return ranges[ranges.length - 1] || {
                    start: 0,
                    end: 0,
                    data: []
                };
            },
            firstItemUid: function () {
                var ranges = this._ranges;
                return ranges.length && ranges[0].data.length && ranges[0].data[0].uid;
            },
            enableRequestsInProgress: function () {
                this._skipRequestsInProgress = false;
            },
            _timeStamp: function () {
                return new Date().getTime();
            },
            range: function (skip, take, callback, action) {
                this._currentRequestTimeStamp = this._timeStamp();
                this._skipRequestsInProgress = true;
                var total = this._isGroupPaged() ? this.groupsTotal(true) : this.total();
                if (action === 'expandGroup' || action === 'collapseGroup') {
                    this._updateOuterRangesLength();
                }
                skip = math.min(skip || 0, total);
                callback = isFunction(callback) ? callback : noop;
                var that = this, pageSkip = math.max(math.floor(skip / take), 0) * take, size = math.min(pageSkip + take, total), data;
                data = that._findRange(skip, math.min(skip + take, total), callback);
                if ((data.length || total === 0) && !that._fetchingGroupItems) {
                    that._processRangeData(data, skip, take, that._originalPageSkip || pageSkip, that._originalSize || size, { action: action });
                    that._originalPageSkip = null;
                    that._originalSize = null;
                    callback();
                    return;
                }
                if (that._isGroupPaged()) {
                    that._originalPageSkip = pageSkip;
                    that._originalSize = size;
                    pageSkip = math.max(math.floor(that._adjustPageSkip(skip, take) / take), 0) * take;
                    size = math.min(pageSkip + take, total);
                }
                if (take !== undefined && !that._fetchingGroupItems) {
                    if (that._isGroupPaged() && !that._groupRangeExists(pageSkip, take) || !that._rangeExists(pageSkip, size)) {
                        that.prefetch(pageSkip, take, function () {
                            if (skip > pageSkip && size < that.total() && !that._rangeExists(size, math.min(size + take, that.total()))) {
                                that.prefetch(size, take, function () {
                                    that.range(skip, take, callback);
                                });
                            } else {
                                that.range(skip, take, callback);
                            }
                        });
                    } else if (pageSkip < skip) {
                        that.prefetch(size, take, function () {
                            that.range(skip, take, callback);
                        });
                    }
                }
            },
            _findRange: function (start, end, callback) {
                var that = this, ranges = that._ranges, range, data = [], skipIdx, takeIdx, startIndex, endIndex, rangeData, rangeEnd, processed, options = that.options, remote = options.serverSorting || options.serverPaging || options.serverFiltering || options.serverGrouping || options.serverAggregates, flatData, count, length, groupMapOptions = {
                        take: end - start,
                        skip: start,
                        skipped: 0,
                        taken: 0,
                        includeParents: true
                    }, prevRangeEnd, isGroupPaged = that._isGroupPaged(), startField = isGroupPaged ? 'outerStart' : 'start', endField = isGroupPaged ? 'outerEnd' : 'end', currentDataLength;
                for (skipIdx = 0, length = ranges.length; skipIdx < length; skipIdx++) {
                    range = ranges[skipIdx];
                    if (isGroupPaged) {
                        if (range.outerStart >= end) {
                            return [];
                        }
                        if (start > range.outerEnd) {
                            groupMapOptions.skipped += range.outerEnd - (prevRangeEnd || 0);
                            prevRangeEnd = range.outerEnd;
                            continue;
                        }
                        if (typeof prevRangeEnd !== 'undefined' && prevRangeEnd != range.outerStart) {
                            groupMapOptions.skipped += range.outerStart - prevRangeEnd;
                        }
                        if (groupMapOptions.skipped > groupMapOptions.skip) {
                            return [];
                        }
                        if (typeof prevRangeEnd === 'undefined' && start > 0 && range.start > 0) {
                            groupMapOptions.skipped = range.outerStart;
                        }
                        takeIdx = skipIdx;
                        while (true) {
                            this._findGroupedRange(range.data, data, groupMapOptions, null, callback);
                            currentDataLength = that._calculateGroupsTotal(data, true, 'currentItems');
                            if (currentDataLength >= groupMapOptions.take) {
                                return data;
                            }
                            if (that._fetchingGroupItems) {
                                return [];
                            }
                            takeIdx++;
                            if (ranges[takeIdx] && ranges[takeIdx].outerStart === range.outerEnd) {
                                range = ranges[takeIdx];
                            } else {
                                break;
                            }
                        }
                    } else if (start >= range[startField] && start <= range[endField]) {
                        count = 0;
                        for (takeIdx = skipIdx; takeIdx < length; takeIdx++) {
                            range = ranges[takeIdx];
                            flatData = that._flatData(range.data, true);
                            if (flatData.length && start + count >= range.start) {
                                rangeData = range.data;
                                rangeEnd = range.end;
                                if (!remote) {
                                    if (options.inPlaceSort) {
                                        processed = that._queryProcess(range.data, { filter: that.filter() });
                                    } else {
                                        var sort = normalizeGroupWithoutCompare(that.group() || []).concat(normalizeSort(that.sort() || []));
                                        processed = that._queryProcess(range.data, {
                                            sort: sort,
                                            filter: that.filter()
                                        });
                                    }
                                    flatData = rangeData = processed.data;
                                    if (processed.total !== undefined) {
                                        rangeEnd = processed.total;
                                    }
                                }
                                startIndex = 0;
                                if (start + count > range.start) {
                                    startIndex = start + count - range.start;
                                }
                                endIndex = flatData.length;
                                if (rangeEnd > end) {
                                    endIndex = endIndex - (rangeEnd - end);
                                }
                                count += endIndex - startIndex;
                                data = that._mergeGroups(data, rangeData, startIndex, endIndex);
                                if (end <= range.end && count == end - start) {
                                    return data;
                                }
                            }
                        }
                        break;
                    }
                    prevRangeEnd = range.outerEnd;
                }
                return [];
            },
            _getRangesMismatch: function (pageSkip) {
                var that = this;
                var ranges = that._ranges;
                var mismatch = 0;
                var i = 0;
                while (true) {
                    var range = ranges[i];
                    if (!range || range.outerStart > pageSkip) {
                        break;
                    }
                    if (range.outerEnd != range.end) {
                        mismatch = range.outerEnd - range.end;
                    }
                    i++;
                }
                return mismatch;
            },
            _mergeGroups: function (data, range, skip, take) {
                if (this._isServerGrouped()) {
                    var temp = range.toJSON(), prevGroup;
                    if (data.length) {
                        prevGroup = data[data.length - 1];
                    }
                    mergeGroups(prevGroup, temp, skip, take);
                    return data.concat(temp);
                }
                return data.concat(range.slice(skip, take));
            },
            _processRangeData: function (data, skip, take, pageSkip, size, eventData) {
                var that = this;
                that._pending = undefined;
                that._skip = skip > that.skip() && !that._omitPrefetch ? math.min(size, (that.totalPages() - 1) * that.take()) : pageSkip;
                that._currentRangeStart = skip;
                that._take = take;
                var paging = that.options.serverPaging;
                var sorting = that.options.serverSorting;
                var filtering = that.options.serverFiltering;
                var aggregates = that.options.serverAggregates;
                try {
                    that.options.serverPaging = true;
                    if (!that._isServerGrouped() && !(that.group() && that.group().length)) {
                        that.options.serverSorting = true;
                    }
                    that.options.serverFiltering = true;
                    that.options.serverPaging = true;
                    that.options.serverAggregates = true;
                    if (paging) {
                        that._detachObservableParents();
                        that._data = data = that._observe(data);
                    }
                    that._process(data, eventData);
                } finally {
                    that.options.serverPaging = paging;
                    that.options.serverSorting = sorting;
                    that.options.serverFiltering = filtering;
                    that.options.serverAggregates = aggregates;
                }
            },
            skip: function () {
                var that = this;
                if (that._skip === undefined) {
                    return that._page !== undefined ? (that._page - 1) * (that.take() || 1) : undefined;
                }
                return that._skip;
            },
            currentRangeStart: function () {
                return this._currentRangeStart || 0;
            },
            take: function () {
                return this._take || this._pageSize;
            },
            _prefetchSuccessHandler: function (skip, size, callback, force) {
                var that = this;
                var timestamp = that._timeStamp();
                return function (data) {
                    var found = false, range = {
                            start: skip,
                            end: size,
                            data: [],
                            timestamp: that._timeStamp()
                        }, idx, length, temp;
                    that._dequeueRequest();
                    that.trigger(REQUESTEND, {
                        response: data,
                        type: 'read'
                    });
                    data = that.reader.parse(data);
                    temp = that._readData(data);
                    if (temp.length) {
                        for (idx = 0, length = that._ranges.length; idx < length; idx++) {
                            if (that._ranges[idx].start === skip) {
                                found = true;
                                range = that._ranges[idx];
                                if (!that._isGroupPaged()) {
                                    range.pristineData = temp;
                                    range.data = that._observe(temp);
                                    range.end = range.start + that._flatData(range.data, true).length;
                                    that._sortRanges();
                                }
                                break;
                            }
                        }
                        if (!found) {
                            that._addRange(that._observe(temp), skip);
                        }
                    }
                    that._total = that.reader.total(data);
                    if (force || (timestamp >= that._currentRequestTimeStamp || !that._skipRequestsInProgress)) {
                        if (callback && temp.length) {
                            callback();
                        } else {
                            that.trigger(CHANGE, {});
                        }
                    }
                };
            },
            prefetch: function (skip, take, callback) {
                var that = this, size = math.min(skip + take, that.total()), options = {
                        take: take,
                        skip: skip,
                        page: skip / take + 1,
                        pageSize: take,
                        sort: that._sort,
                        filter: that._filter,
                        group: that._group,
                        aggregate: that._aggregate
                    };
                if (that._isGroupPaged() && !that._isServerGrouped() && that._groupRangeExists(skip, size)) {
                    if (callback) {
                        callback();
                    }
                    return;
                }
                if (that._isServerGroupPaged() && !that._groupRangeExists(skip, size) || !that._rangeExists(skip, size)) {
                    clearTimeout(that._timeout);
                    that._timeout = setTimeout(function () {
                        that._queueRequest(options, function () {
                            if (!that.trigger(REQUESTSTART, { type: 'read' })) {
                                if (that._omitPrefetch) {
                                    that.trigger(PROGRESS);
                                }
                                that.transport.read({
                                    data: that._params(options),
                                    success: that._prefetchSuccessHandler(skip, size, callback),
                                    error: function () {
                                        var args = slice.call(arguments);
                                        that.error.apply(that, args);
                                    }
                                });
                            } else {
                                that._dequeueRequest();
                            }
                        });
                    }, 100);
                } else if (callback) {
                    callback();
                }
            },
            _multiplePrefetch: function (skip, take, callback) {
                var that = this, size = math.min(skip + take, that.total()), options = {
                        take: take,
                        skip: skip,
                        page: skip / take + 1,
                        pageSize: take,
                        sort: that._sort,
                        filter: that._filter,
                        group: that._group,
                        aggregate: that._aggregate
                    };
                if (!that._rangeExists(skip, size)) {
                    if (!that.trigger(REQUESTSTART, { type: 'read' })) {
                        that.transport.read({
                            data: that._params(options),
                            success: that._prefetchSuccessHandler(skip, size, callback, true)
                        });
                    }
                } else if (callback) {
                    callback();
                }
            },
            _adjustPageSkip: function (start, take) {
                var that = this;
                var prevRange = that._getPrevRange(start);
                var result;
                var total = that.total();
                var mismatch;
                if (prevRange) {
                    mismatch = that._getRangesMismatch(start);
                    if (!mismatch) {
                        return start;
                    }
                    start -= mismatch;
                }
                result = math.max(math.floor(start / take), 0) * take;
                if (result > total) {
                    while (true) {
                        result -= take;
                        if (result < total) {
                            break;
                        }
                    }
                }
                return result;
            },
            _getNextRange: function (end) {
                var that = this, ranges = that._ranges, idx, length;
                for (idx = 0, length = ranges.length; idx < length; idx++) {
                    if (ranges[idx].start <= end && ranges[idx].end >= end) {
                        return ranges[idx];
                    }
                }
            },
            _getPrevRange: function (start) {
                var that = this, ranges = that._ranges, idx, range, length = ranges.length;
                for (idx = length - 1; idx >= 0; idx--) {
                    if (ranges[idx].outerStart <= start) {
                        range = ranges[idx];
                        break;
                    }
                }
                return range;
            },
            _rangeExists: function (start, end) {
                var that = this, ranges = that._ranges, idx, length;
                for (idx = 0, length = ranges.length; idx < length; idx++) {
                    if (ranges[idx].start <= start && ranges[idx].end >= end) {
                        return true;
                    }
                }
                return false;
            },
            _groupRangeExists: function (start, end) {
                var that = this, ranges = that._ranges, idx, length, availableItemsCount = 0, total = that.groupsTotal(true);
                if (end > total && !that._isServerGrouped()) {
                    end = total;
                }
                for (idx = 0, length = ranges.length; idx < length; idx++) {
                    var range = ranges[idx];
                    if (range.outerStart <= start && range.outerEnd >= start) {
                        availableItemsCount += range.outerEnd - start;
                    } else if (range.outerStart <= end && range.outerEnd >= end) {
                        availableItemsCount += end - range.outerStart;
                    }
                }
                return availableItemsCount >= end - start;
            },
            _getCurrentRangeSpan: function () {
                var that = this;
                var ranges = that._ranges;
                var start = that.currentRangeStart();
                var end = start + (that.take() || 0);
                var rangeSpan = [];
                var range;
                var idx;
                var length = ranges.length;
                for (idx = 0; idx < length; idx++) {
                    range = ranges[idx];
                    if (range.start <= start && range.end >= start || range.start >= start && range.start <= end) {
                        rangeSpan.push(range);
                    }
                }
                return rangeSpan;
            },
            _removeModelFromRanges: function (model) {
                var that = this;
                var range;
                for (var idx = 0, length = this._ranges.length; idx < length; idx++) {
                    range = this._ranges[idx];
                    that._removeModelFromRange(range, model);
                }
                that._updateRangesLength();
            },
            _removeModelFromRange: function (range, model) {
                this._eachItem(range.data, function (data) {
                    if (!data) {
                        return;
                    }
                    for (var idx = 0; idx < data.length; idx++) {
                        var dataItem = data[idx];
                        if (dataItem.uid && dataItem.uid == model.uid) {
                            [].splice.call(data, idx, 1);
                            break;
                        }
                    }
                });
            },
            _insertModelInRange: function (index, model) {
                var that = this;
                var ranges = that._ranges || [];
                var rangesLength = ranges.length;
                var range;
                var i;
                for (i = 0; i < rangesLength; i++) {
                    range = ranges[i];
                    if (range.start <= index && range.end >= index) {
                        if (!that._getByUid(model.uid, range.data)) {
                            if (that._isServerGrouped()) {
                                range.data.splice(index, 0, that._wrapInEmptyGroup(model));
                            } else {
                                range.data.splice(index, 0, model);
                            }
                        }
                        break;
                    }
                }
                that._updateRangesLength();
            },
            _updateRangesLength: function () {
                var that = this;
                var ranges = that._ranges || [];
                var rangesLength = ranges.length;
                var mismatchFound = false;
                var mismatchLength = 0;
                var lengthDifference = 0;
                var rangeLength;
                var range;
                var i;
                for (i = 0; i < rangesLength; i++) {
                    range = ranges[i];
                    rangeLength = that._isGroupPaged() ? range.data.length : that._flatData(range.data, true).length;
                    lengthDifference = rangeLength - math.abs(range.end - range.start);
                    if (!mismatchFound && lengthDifference !== 0) {
                        mismatchFound = true;
                        mismatchLength = lengthDifference;
                        range.end += mismatchLength;
                        continue;
                    }
                    if (mismatchFound) {
                        range.start += mismatchLength;
                        range.end += mismatchLength;
                    }
                }
            },
            _updateOuterRangesLength: function () {
                var that = this;
                var ranges = that._ranges || [];
                var rangesLength = ranges.length;
                var mismatchLength = 0;
                var range;
                var i;
                var prevRange;
                var rangeLength;
                for (i = 0; i < rangesLength; i++) {
                    range = ranges[i];
                    rangeLength = that._isGroupPaged() ? that._calculateGroupsTotal(range.data, true, 'items', true) : that._flatData(range.data, true).length;
                    if (prevRange) {
                        if (prevRange.end != range.start) {
                            mismatchLength = range.start - prevRange.end;
                        }
                        range.outerStart = prevRange.outerEnd + mismatchLength;
                        mismatchLength = 0;
                    } else {
                        range.outerStart = range.start;
                    }
                    range.outerEnd = range.outerStart + rangeLength;
                    prevRange = range;
                }
            }
        });
        var Transport = {};
        Transport.create = function (options, data, dataSource) {
            var transport, transportOptions = options.transport ? $.extend({}, options.transport) : null;
            if (transportOptions) {
                transportOptions.read = typeof transportOptions.read === STRING ? { url: transportOptions.read } : transportOptions.read;
                if (options.type === 'jsdo') {
                    transportOptions.dataSource = dataSource;
                }
                if (options.type) {
                    quilt.data.transports = quilt.data.transports || {};
                    quilt.data.schemas = quilt.data.schemas || {};
                    if (!quilt.data.transports[options.type]) {
                        quilt.logToConsole('Unknown DataSource transport type \'' + options.type + '\'.\nVerify that registration scripts for this type are included after Quilt on the page.', 'warn');
                    } else if (!isPlainObject(quilt.data.transports[options.type])) {
                        transport = new quilt.data.transports[options.type](extend(transportOptions, { data: data }));
                    } else {
                        transportOptions = extend(true, {}, quilt.data.transports[options.type], transportOptions);
                    }
                    options.schema = extend(true, {}, quilt.data.schemas[options.type], options.schema);
                }
                if (!transport) {
                    transport = isFunction(transportOptions.read) ? transportOptions : new RemoteTransport(transportOptions);
                }
            } else {
                transport = new LocalTransport({ data: options.data || [] });
            }
            return transport;
        };
        DataSource.create = function (options) {
            if (isArray(options) || options instanceof ObservableArray) {
                options = { data: options };
            }
            var dataSource = options || {}, data = dataSource.data, fields = dataSource.fields, table = dataSource.table, select = dataSource.select, idx, length, model = {}, field;
            if (!data && fields && !dataSource.transport) {
                if (table) {
                    data = inferTable(table, fields);
                } else if (select) {
                    data = inferSelect(select, fields);
                    if (dataSource.group === undefined && data[0] && data[0].optgroup !== undefined) {
                        dataSource.group = 'optgroup';
                    }
                }
            }
            if (quilt.data.Model && fields && (!dataSource.schema || !dataSource.schema.model)) {
                for (idx = 0, length = fields.length; idx < length; idx++) {
                    field = fields[idx];
                    if (field.type) {
                        model[field.field] = field;
                    }
                }
                if (!isEmptyObject(model)) {
                    dataSource.schema = extend(true, dataSource.schema, { model: { fields: model } });
                }
            }
            dataSource.data = data;
            select = null;
            dataSource.select = null;
            table = null;
            dataSource.table = null;
            return dataSource instanceof DataSource ? dataSource : new DataSource(dataSource);
        };
        function inferSelect(select, fields) {
            select = $(select)[0];
            var options = select.options;
            var firstField = fields[0];
            var secondField = fields[1];
            var data = [];
            var idx, length;
            var optgroup;
            var option;
            var record;
            var value;
            for (idx = 0, length = options.length; idx < length; idx++) {
                record = {};
                option = options[idx];
                optgroup = option.parentNode;
                if (optgroup === select) {
                    optgroup = null;
                }
                if (option.disabled || optgroup && optgroup.disabled) {
                    continue;
                }
                if (optgroup) {
                    record.optgroup = optgroup.label;
                }
                record[firstField.field] = option.text;
                value = option.attributes.value;
                if (value && value.specified) {
                    value = option.value;
                } else {
                    value = option.text;
                }
                record[secondField.field] = value;
                data.push(record);
            }
            return data;
        }
        function inferTable(table, fields) {
            var tbody = $(table)[0].tBodies[0], rows = tbody ? tbody.rows : [], idx, length, fieldIndex, fieldCount = fields.length, data = [], cells, record, cell, empty;
            for (idx = 0, length = rows.length; idx < length; idx++) {
                record = {};
                empty = true;
                cells = rows[idx].cells;
                for (fieldIndex = 0; fieldIndex < fieldCount; fieldIndex++) {
                    cell = cells[fieldIndex];
                    if (cell.nodeName.toLowerCase() !== 'th') {
                        empty = false;
                        record[fields[fieldIndex].field] = cell.innerHTML;
                    }
                }
                if (!empty) {
                    data.push(record);
                }
            }
            return data;
        }
        var Node = Model.define({
            idField: 'id',
            init: function (value) {
                var that = this, hasChildren = that.hasChildren || value && value.hasChildren, childrenField = 'items', childrenOptions = {};
                quilt.data.Model.fn.init.call(that, value);
                if (typeof that.children === STRING) {
                    childrenField = that.children;
                }
                childrenOptions = {
                    schema: {
                        data: childrenField,
                        model: {
                            hasChildren: hasChildren,
                            id: that.idField,
                            fields: that.fields
                        }
                    }
                };
                if (typeof that.children !== STRING) {
                    extend(childrenOptions, that.children);
                }
                childrenOptions.data = value;
                if (!hasChildren) {
                    hasChildren = childrenOptions.schema.data;
                }
                if (typeof hasChildren === STRING) {
                    hasChildren = quilt.getter(hasChildren);
                }
                if (isFunction(hasChildren)) {
                    var hasChildrenObject = hasChildren.call(that, that);
                    if (hasChildrenObject && hasChildrenObject.length === 0) {
                        that.hasChildren = false;
                    } else {
                        that.hasChildren = !!hasChildrenObject;
                    }
                }
                that._childrenOptions = childrenOptions;
                if (that.hasChildren) {
                    that._initChildren();
                }
                that._loaded = !!(value && value._loaded);
            },
            _initChildren: function () {
                var that = this;
                var children, transport, parameterMap;
                if (!(that.children instanceof HierarchicalDataSource)) {
                    children = that.children = new HierarchicalDataSource(that._childrenOptions);
                    transport = children.transport;
                    parameterMap = transport.parameterMap;
                    transport.parameterMap = function (data, type) {
                        data[that.idField || 'id'] = that.id;
                        if (parameterMap) {
                            data = parameterMap.call(that, data, type);
                        }
                        return data;
                    };
                    children.parent = function () {
                        return that;
                    };
                    children.bind(CHANGE, function (e) {
                        e.node = e.node || that;
                        that.trigger(CHANGE, e);
                    });
                    children.bind(ERROR, function (e) {
                        var collection = that.parent();
                        if (collection) {
                            e.node = e.node || that;
                            collection.trigger(ERROR, e);
                        }
                    });
                    that._updateChildrenField();
                }
            },
            append: function (model) {
                this._initChildren();
                this.loaded(true);
                this.children.add(model);
            },
            hasChildren: false,
            level: function () {
                var parentNode = this.parentNode(), level = 0;
                while (parentNode && parentNode.parentNode) {
                    level++;
                    parentNode = parentNode.parentNode ? parentNode.parentNode() : null;
                }
                return level;
            },
            _updateChildrenField: function () {
                var fieldName = this._childrenOptions.schema.data;
                this[fieldName || 'items'] = this.children.data();
            },
            _childrenLoaded: function () {
                this._loaded = true;
                this._updateChildrenField();
            },
            load: function () {
                var options = {};
                var method = '_query';
                var children, promise;
                if (this.hasChildren) {
                    this._initChildren();
                    children = this.children;
                    options[this.idField || 'id'] = this.id;
                    if (!this._loaded) {
                        children._data = undefined;
                        method = 'read';
                    }
                    children.one(CHANGE, proxy(this._childrenLoaded, this));
                    if (this._matchFilter) {
                        options.filter = {
                            field: '_matchFilter',
                            operator: 'eq',
                            value: true
                        };
                    }
                    promise = children[method](options);
                } else {
                    this.loaded(true);
                }
                return promise || $.Deferred().resolve().promise();
            },
            parentNode: function () {
                var array = this.parent();
                return array.parent();
            },
            loaded: function (value) {
                if (value !== undefined) {
                    this._loaded = value;
                } else {
                    return this._loaded;
                }
            },
            shouldSerialize: function (field) {
                return Model.fn.shouldSerialize.call(this, field) && field !== 'children' && field !== '_loaded' && field !== 'hasChildren' && field !== '_childrenOptions';
            }
        });
        function dataMethod(name) {
            return function () {
                var data = this._data, result = DataSource.fn[name].apply(this, slice.call(arguments));
                if (this._data != data) {
                    this._attachBubbleHandlers();
                }
                return result;
            };
        }
        var HierarchicalDataSource = DataSource.extend({
            init: function (options) {
                var node = Node.define({ children: options });
                if (options.filter && !options.serverFiltering) {
                    this._hierarchicalFilter = options.filter;
                    options.filter = null;
                }
                DataSource.fn.init.call(this, extend(true, {}, {
                    schema: {
                        modelBase: node,
                        model: node
                    }
                }, options));
                this._attachBubbleHandlers();
            },
            _attachBubbleHandlers: function () {
                var that = this;
                that._data.bind(ERROR, function (e) {
                    that.trigger(ERROR, e);
                });
            },
            read: function (data) {
                var result = DataSource.fn.read.call(this, data);
                if (this._hierarchicalFilter) {
                    if (this._data && this._data.length > 0) {
                        this.filter(this._hierarchicalFilter);
                    } else {
                        this.options.filter = this._hierarchicalFilter;
                        this._filter = normalizeFilter(this.options.filter);
                        this._hierarchicalFilter = null;
                    }
                }
                return result;
            },
            remove: function (node) {
                var parentNode = node.parentNode(), dataSource = this, result;
                if (parentNode && parentNode._initChildren) {
                    dataSource = parentNode.children;
                }
                result = DataSource.fn.remove.call(dataSource, node);
                if (parentNode && !dataSource.data().length) {
                    parentNode.hasChildren = false;
                }
                return result;
            },
            success: dataMethod('success'),
            data: dataMethod('data'),
            insert: function (index, model) {
                var parentNode = this.parent();
                if (parentNode && parentNode._initChildren) {
                    parentNode.hasChildren = true;
                    parentNode._initChildren();
                }
                return DataSource.fn.insert.call(this, index, model);
            },
            filter: function (val) {
                if (val === undefined) {
                    return this._filter;
                }
                if (!this.options.serverFiltering && this._markHierarchicalQuery(val)) {
                    val = {
                        logic: 'or',
                        filters: [
                            val,
                            {
                                field: '_matchFilter',
                                operator: 'equals',
                                value: true
                            }
                        ]
                    };
                }
                this.trigger('reset');
                this._query({
                    filter: val,
                    page: 1
                });
            },
            _markHierarchicalQuery: function (expressions) {
                var compiled;
                var predicate;
                var fields;
                var operators;
                var filter;
                var accentFoldingFiltering = this.options.accentFoldingFiltering;
                expressions = accentFoldingFiltering ? $.extend({}, normalizeFilter(expressions), { accentFoldingFiltering: accentFoldingFiltering }) : normalizeFilter(expressions);
                if (!expressions || expressions.filters.length === 0) {
                    this._updateHierarchicalFilter(function () {
                        return true;
                    });
                    return false;
                }
                compiled = Query.filterExpr(expressions);
                fields = compiled.fields;
                operators = compiled.operators;
                predicate = filter = new Function('d, __f, __o', 'return ' + compiled.expression);
                if (fields.length || operators.length) {
                    filter = function (d) {
                        return predicate(d, fields, operators);
                    };
                }
                this._updateHierarchicalFilter(filter);
                return true;
            },
            _updateHierarchicalFilter: function (filter) {
                var current;
                var data = this._data;
                var result = false;
                for (var idx = 0; idx < data.length; idx++) {
                    current = data[idx];
                    if (current.hasChildren) {
                        current._matchFilter = current.children._updateHierarchicalFilter(filter);
                        if (!current._matchFilter) {
                            current._matchFilter = filter(current);
                        }
                    } else {
                        current._matchFilter = filter(current);
                    }
                    if (current._matchFilter) {
                        result = true;
                    }
                }
                return result;
            },
            _find: function (method, value) {
                var idx, length, node, children;
                var data = this._data;
                if (!data) {
                    return;
                }
                node = DataSource.fn[method].call(this, value);
                if (node) {
                    return node;
                }
                data = this._flatData(this._data);
                for (idx = 0, length = data.length; idx < length; idx++) {
                    children = data[idx].children;
                    if (!(children instanceof HierarchicalDataSource)) {
                        continue;
                    }
                    node = children[method](value);
                    if (node) {
                        return node;
                    }
                }
            },
            get: function (id) {
                return this._find('get', id);
            },
            getByUid: function (uid) {
                return this._find('getByUid', uid);
            }
        });
        function inferList(list, fields) {
            var items = $(list).children(), idx, length, data = [], record, textField = fields[0].field, urlField = fields[1] && fields[1].field, spriteCssClassField = fields[2] && fields[2].field, imageUrlField = fields[3] && fields[3].field, item, id, textChild, className, children;
            function elements(collection, tagName) {
                return collection.filter(tagName).add(collection.find(tagName));
            }
            for (idx = 0, length = items.length; idx < length; idx++) {
                record = { _loaded: true };
                item = items.eq(idx);
                textChild = item[0].firstChild;
                children = item.children();
                list = children.filter('ul');
                children = children.filter(':not(ul)');
                id = item.attr('data-id');
                if (id) {
                    record.id = id;
                }
                if (textChild) {
                    record[textField] = textChild.nodeType == 3 ? textChild.nodeValue : children.text();
                }
                if (urlField) {
                    record[urlField] = elements(children, 'a').attr('href');
                }
                if (imageUrlField) {
                    record[imageUrlField] = elements(children, 'img').attr('src');
                }
                if (spriteCssClassField) {
                    className = elements(children, '.k-sprite').prop('className');
                    record[spriteCssClassField] = className && quilt.trim(className.replace('k-sprite', ''));
                }
                if (list.length) {
                    record.items = inferList(list.eq(0), fields);
                }
                if (item.attr('data-hasChildren') == 'true') {
                    record.hasChildren = true;
                }
                data.push(record);
            }
            return data;
        }
        HierarchicalDataSource.create = function (options) {
            options = options && options.push ? { data: options } : options;
            var dataSource = options || {}, data = dataSource.data, fields = dataSource.fields, list = dataSource.list;
            if (data && data._dataSource) {
                return data._dataSource;
            }
            if (!data && fields && !dataSource.transport) {
                if (list) {
                    data = inferList(list, fields);
                }
            }
            dataSource.data = data;
            return dataSource instanceof HierarchicalDataSource ? dataSource : new HierarchicalDataSource(dataSource);
        };
        var Buffer = quilt.Observable.extend({
            init: function (dataSource, viewSize, disablePrefetch) {
                quilt.Observable.fn.init.call(this);
                this._prefetching = false;
                this.dataSource = dataSource;
                this.prefetch = !disablePrefetch;
                var buffer = this;
                dataSource.bind('change', function () {
                    buffer._change();
                });
                dataSource.bind('reset', function () {
                    buffer._reset();
                });
                this._syncWithDataSource();
                this.setViewSize(viewSize);
            },
            setViewSize: function (viewSize) {
                this.viewSize = viewSize;
                this._recalculate();
            },
            at: function (index) {
                var pageSize = this.pageSize, itemPresent = true;
                if (index >= this.total()) {
                    this.trigger('endreached', { index: index });
                    return null;
                }
                if (!this.useRanges) {
                    return this.dataSource.view()[index];
                }
                if (this.useRanges) {
                    if (index < this.dataOffset || index >= this.skip + pageSize) {
                        itemPresent = this.range(Math.floor(index / pageSize) * pageSize);
                    }
                    if (index === this.prefetchThreshold) {
                        this._prefetch();
                    }
                    if (index === this.midPageThreshold) {
                        this.range(this.nextMidRange, true);
                    } else if (index === this.nextPageThreshold) {
                        this.range(this.nextFullRange);
                    } else if (index === this.pullBackThreshold) {
                        if (this.offset === this.skip) {
                            this.range(this.previousMidRange);
                        } else {
                            this.range(this.previousFullRange);
                        }
                    }
                    if (itemPresent) {
                        return this.dataSource.at(index - this.dataOffset);
                    } else {
                        this.trigger('endreached', { index: index });
                        return null;
                    }
                }
            },
            indexOf: function (item) {
                return this.dataSource.data().indexOf(item) + this.dataOffset;
            },
            total: function () {
                return parseInt(this.dataSource.total(), 10);
            },
            next: function () {
                var buffer = this, pageSize = buffer.pageSize, offset = buffer.skip - buffer.viewSize + pageSize, pageSkip = math.max(math.floor(offset / pageSize), 0) * pageSize;
                this.offset = offset;
                this.dataSource.prefetch(pageSkip, pageSize, function () {
                    buffer._goToRange(offset, true);
                });
            },
            range: function (offset, nextRange) {
                if (this.offset === offset) {
                    return true;
                }
                var buffer = this, pageSize = this.pageSize, pageSkip = math.max(math.floor(offset / pageSize), 0) * pageSize, dataSource = this.dataSource;
                if (nextRange) {
                    pageSkip += pageSize;
                }
                if (dataSource.inRange(offset, pageSize)) {
                    this.offset = offset;
                    this._recalculate();
                    this._goToRange(offset);
                    return true;
                } else if (this.prefetch) {
                    dataSource.prefetch(pageSkip, pageSize, function () {
                        buffer.offset = offset;
                        buffer._recalculate();
                        buffer._goToRange(offset, true);
                    });
                    return false;
                }
                return true;
            },
            syncDataSource: function () {
                var offset = this.offset;
                this.offset = null;
                this.range(offset);
            },
            destroy: function () {
                this.unbind();
            },
            _prefetch: function () {
                var buffer = this, pageSize = this.pageSize, prefetchOffset = this.skip + pageSize, dataSource = this.dataSource;
                if (!dataSource.inRange(prefetchOffset, pageSize) && !this._prefetching && this.prefetch) {
                    this._prefetching = true;
                    this.trigger('prefetching', {
                        skip: prefetchOffset,
                        take: pageSize
                    });
                    dataSource.prefetch(prefetchOffset, pageSize, function () {
                        buffer._prefetching = false;
                        buffer.trigger('prefetched', {
                            skip: prefetchOffset,
                            take: pageSize
                        });
                    });
                }
            },
            _goToRange: function (offset, expanding) {
                if (this.offset !== offset) {
                    return;
                }
                this.dataOffset = offset;
                this._expanding = expanding;
                this.dataSource.range(offset, this.pageSize);
                this.dataSource.enableRequestsInProgress();
            },
            _reset: function () {
                this._syncPending = true;
            },
            _change: function () {
                var dataSource = this.dataSource;
                this.length = this.useRanges ? dataSource.lastRange().end : dataSource.view().length;
                if (this._syncPending) {
                    this._syncWithDataSource();
                    this._recalculate();
                    this._syncPending = false;
                    this.trigger('reset', { offset: this.offset });
                }
                this.trigger('resize');
                if (this._expanding) {
                    this.trigger('expand');
                }
                delete this._expanding;
            },
            _syncWithDataSource: function () {
                var dataSource = this.dataSource;
                this._firstItemUid = dataSource.firstItemUid();
                this.dataOffset = this.offset = dataSource.skip() || 0;
                this.pageSize = dataSource.pageSize();
                this.useRanges = dataSource.options.serverPaging;
            },
            _recalculate: function () {
                var pageSize = this.pageSize, offset = this.offset, viewSize = this.viewSize, skip = Math.ceil(offset / pageSize) * pageSize;
                this.skip = skip;
                this.midPageThreshold = skip + pageSize - 1;
                this.nextPageThreshold = skip + viewSize - 1;
                this.prefetchThreshold = skip + Math.floor(pageSize / 3 * 2);
                this.pullBackThreshold = this.offset - 1;
                this.nextMidRange = skip + pageSize - viewSize;
                this.nextFullRange = skip;
                this.previousMidRange = offset - viewSize;
                this.previousFullRange = skip - pageSize;
            }
        });
        var BatchBuffer = quilt.Observable.extend({
            init: function (dataSource, batchSize) {
                var batchBuffer = this;
                quilt.Observable.fn.init.call(batchBuffer);
                this.dataSource = dataSource;
                this.batchSize = batchSize;
                this._total = 0;
                this.buffer = new Buffer(dataSource, batchSize * 3);
                this.buffer.bind({
                    'endreached': function (e) {
                        batchBuffer.trigger('endreached', { index: e.index });
                    },
                    'prefetching': function (e) {
                        batchBuffer.trigger('prefetching', {
                            skip: e.skip,
                            take: e.take
                        });
                    },
                    'prefetched': function (e) {
                        batchBuffer.trigger('prefetched', {
                            skip: e.skip,
                            take: e.take
                        });
                    },
                    'reset': function () {
                        batchBuffer._total = 0;
                        batchBuffer.trigger('reset');
                    },
                    'resize': function () {
                        batchBuffer._total = Math.ceil(this.length / batchBuffer.batchSize);
                        batchBuffer.trigger('resize', {
                            total: batchBuffer.total(),
                            offset: this.offset
                        });
                    }
                });
            },
            syncDataSource: function () {
                this.buffer.syncDataSource();
            },
            at: function (index) {
                var buffer = this.buffer, skip = index * this.batchSize, take = this.batchSize, view = [], item;
                if (buffer.offset > skip) {
                    buffer.at(buffer.offset - 1);
                }
                for (var i = 0; i < take; i++) {
                    item = buffer.at(skip + i);
                    if (item === null) {
                        break;
                    }
                    view.push(item);
                }
                return view;
            },
            total: function () {
                return this._total;
            },
            destroy: function () {
                this.buffer.destroy();
                this.unbind();
            }
        });
        extend(true, quilt.data, {
            readers: { json: DataReader },
            Query: Query,
            DataSource: DataSource,
            HierarchicalDataSource: HierarchicalDataSource,
            Node: Node,
            Comparer: Comparer,
            ObservableObject: ObservableObject,
            ObservableArray: ObservableArray,
            LazyObservableArray: LazyObservableArray,
            LocalTransport: LocalTransport,
            RemoteTransport: RemoteTransport,
            Cache: Cache,
            DataReader: DataReader,
            Model: Model,
            Buffer: Buffer,
            BatchBuffer: BatchBuffer
        });
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.data.signalr', ['quilt.data'], f);
}(function () {
    var __meta__ = {
        id: 'data.signalr',
        name: 'SignalR',
        category: 'framework',
        depends: ['data'],
        hidden: true
    };
    (function ($) {
        var quilt = window.quilt;
        var isFunction = quilt.isFunction;
        function isJQueryPromise(promise) {
            return promise && isFunction(promise.done) && isFunction(promise.fail);
        }
        function isNativePromise(promise) {
            return promise && isFunction(promise.then) && isFunction(promise.catch);
        }
        var transport = quilt.data.RemoteTransport.extend({
            init: function (options) {
                var signalr = options && options.signalr ? options.signalr : {};
                var promise = signalr.promise;
                if (!promise) {
                    throw new Error('The "promise" option must be set.');
                }
                if (!isJQueryPromise(promise) && !isNativePromise(promise)) {
                    throw new Error('The "promise" option must be a Promise.');
                }
                this.promise = promise;
                var hub = signalr.hub;
                if (!hub) {
                    throw new Error('The "hub" option must be set.');
                }
                if (typeof hub.on != 'function' || typeof hub.invoke != 'function') {
                    throw new Error('The "hub" option is not a valid SignalR hub proxy.');
                }
                this.hub = hub;
                quilt.data.RemoteTransport.fn.init.call(this, options);
            },
            push: function (callbacks) {
                var client = this.options.signalr.client || {};
                if (client.create) {
                    this.hub.on(client.create, callbacks.pushCreate);
                }
                if (client.update) {
                    this.hub.on(client.update, callbacks.pushUpdate);
                }
                if (client.destroy) {
                    this.hub.on(client.destroy, callbacks.pushDestroy);
                }
            },
            _crud: function (options, type) {
                var hub = this.hub;
                var promise = this.promise;
                var server = this.options.signalr.server;
                if (!server || !server[type]) {
                    throw new Error(quilt.format('The "server.{0}" option must be set.', type));
                }
                var args = [server[type]];
                var data = this.parameterMap(options.data, type);
                if (!$.isEmptyObject(data)) {
                    args.push(data);
                }
                if (isJQueryPromise(promise)) {
                    promise.done(function () {
                        hub.invoke.apply(hub, args).done(options.success).fail(options.error);
                    });
                } else if (isNativePromise(promise)) {
                    promise.then(function () {
                        hub.invoke.apply(hub, args).then(options.success).catch(options.error);
                    });
                }
            },
            read: function (options) {
                this._crud(options, 'read');
            },
            create: function (options) {
                this._crud(options, 'create');
            },
            update: function (options) {
                this._crud(options, 'update');
            },
            destroy: function (options) {
                this._crud(options, 'destroy');
            }
        });
        $.extend(true, quilt.data, { transports: { signalr: transport } });
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.binder', [
        'quilt.core',
        'quilt.data'
    ], f);
}(function () {
    var __meta__ = {
        id: 'binder',
        name: 'MVVM',
        category: 'framework',
        description: 'Model View ViewModel (MVVM) is a design pattern which helps developers separate the Model (the data) from the View (the UI).',
        depends: [
            'core',
            'data'
        ]
    };
    (function ($, undefined) {
        var quilt = window.quilt, Observable = quilt.Observable, ObservableObject = quilt.data.ObservableObject, ObservableArray = quilt.data.ObservableArray, toString = {}.toString, binders = {}, Class = quilt.Class, proxy = $.proxy, VALUE = 'value', SOURCE = 'source', EVENTS = 'events', CHECKED = 'checked', CSS = 'css', deleteExpando = true, FUNCTION = 'function', CHANGE = 'change';
        (function () {
            var a = document.createElement('a');
            try {
                delete a.test;
            } catch (e) {
                deleteExpando = false;
            }
        }());
        var Binding = Observable.extend({
            init: function (parents, path) {
                var that = this;
                Observable.fn.init.call(that);
                that.source = parents[0];
                that.parents = parents;
                that.path = path;
                that.dependencies = {};
                that.dependencies[path] = true;
                that.observable = that.source instanceof Observable;
                that._access = function (e) {
                    that.dependencies[e.field] = true;
                };
                if (that.observable) {
                    that._change = function (e) {
                        that.change(e);
                    };
                    that.source.bind(CHANGE, that._change);
                }
            },
            _parents: function () {
                var parents = this.parents;
                var value = this.get();
                if (value && typeof value.parent == 'function') {
                    var parent = value.parent();
                    if ($.inArray(parent, parents) < 0) {
                        parents = [parent].concat(parents);
                    }
                }
                return parents;
            },
            change: function (e) {
                var dependency, ch, field = e.field, that = this;
                if (that.path === 'this') {
                    that.trigger(CHANGE, e);
                } else {
                    for (dependency in that.dependencies) {
                        if (dependency.indexOf(field) === 0) {
                            ch = dependency.charAt(field.length);
                            if (!ch || ch === '.' || ch === '[') {
                                that.trigger(CHANGE, e);
                                break;
                            }
                        }
                    }
                }
            },
            start: function (source) {
                source.bind('get', this._access);
            },
            stop: function (source) {
                source.unbind('get', this._access);
            },
            get: function () {
                var that = this, source = that.source, index = 0, path = that.path, result = source;
                if (!that.observable) {
                    return result;
                }
                that.start(that.source);
                result = source.get(path);
                while (result === undefined && source) {
                    source = that.parents[++index];
                    if (source instanceof ObservableObject) {
                        result = source.get(path);
                    }
                }
                if (result === undefined) {
                    source = that.source;
                    while (result === undefined && source) {
                        source = source.parent();
                        if (source instanceof ObservableObject) {
                            result = source.get(path);
                        }
                    }
                }
                if (typeof result === 'function') {
                    index = path.lastIndexOf('.');
                    if (index > 0) {
                        source = source.get(path.substring(0, index));
                    }
                    that.start(source);
                    if (source !== that.source) {
                        result = result.call(source, that.source);
                    } else {
                        result = result.call(source);
                    }
                    that.stop(source);
                }
                if (source && source !== that.source) {
                    that.currentSource = source;
                    source.unbind(CHANGE, that._change).bind(CHANGE, that._change);
                }
                that.stop(that.source);
                return result;
            },
            set: function (value) {
                var source = this.currentSource || this.source;
                var field = quilt.getter(this.path)(source);
                if (typeof field === 'function') {
                    if (source !== this.source) {
                        field.call(source, this.source, value);
                    } else {
                        field.call(source, value);
                    }
                } else {
                    source.set(this.path, value);
                }
            },
            destroy: function () {
                if (this.observable) {
                    this.source.unbind(CHANGE, this._change);
                    if (this.currentSource) {
                        this.currentSource.unbind(CHANGE, this._change);
                    }
                }
                this.unbind();
            }
        });
        var EventBinding = Binding.extend({
            get: function () {
                var source = this.source, path = this.path, index = 0, handler;
                handler = source.get(path);
                while (!handler && source) {
                    source = this.parents[++index];
                    if (source instanceof ObservableObject) {
                        handler = source.get(path);
                    }
                }
                return proxy(handler, source);
            }
        });
        var TemplateBinding = Binding.extend({
            init: function (source, path, template) {
                var that = this;
                Binding.fn.init.call(that, source, path);
                that.template = template;
            },
            render: function (value) {
                var html;
                this.start(this.source);
                html = quilt.render(this.template, value);
                this.stop(this.source);
                return html;
            }
        });
        var Binder = Class.extend({
            init: function (element, bindings, options) {
                this.element = element;
                this.bindings = bindings;
                this.options = options;
            },
            bind: function (binding, attribute) {
                var that = this;
                binding = attribute ? binding[attribute] : binding;
                binding.bind(CHANGE, function (e) {
                    that.refresh(attribute || e);
                });
                that.refresh(attribute);
            },
            destroy: function () {
            }
        });
        var TypedBinder = Binder.extend({
            dataType: function () {
                var dataType = this.element.getAttribute('data-' + quilt.ns + 'type') || this.element.type || 'text';
                return dataType.toLowerCase();
            },
            parsedValue: function () {
                return this._parseValue(this.element.value, this.dataType());
            },
            _parseValue: function (value, dataType) {
                if (dataType == 'date') {
                    value = quilt.parseDate(value, 'yyyy-MM-dd');
                } else if (dataType == 'datetime-local') {
                    value = quilt.parseDate(value, [
                        'yyyy-MM-ddTHH:mm:ss',
                        'yyyy-MM-ddTHH:mm'
                    ]);
                } else if (dataType == 'number') {
                    value = quilt.parseFloat(value);
                } else if (dataType == 'boolean') {
                    value = value.toLowerCase();
                    if (quilt.parseFloat(value) !== null) {
                        value = Boolean(quilt.parseFloat(value));
                    } else {
                        value = value.toLowerCase() === 'true';
                    }
                }
                return value;
            }
        });
        binders.attr = Binder.extend({
            refresh: function (key) {
                this.element.setAttribute(key, this.bindings.attr[key].get());
            }
        });
        binders.css = Binder.extend({
            init: function (element, bindings, options) {
                Binder.fn.init.call(this, element, bindings, options);
                this.classes = {};
            },
            refresh: function (className) {
                var element = $(this.element), binding = this.bindings.css[className], hasClass = this.classes[className] = binding.get();
                if (hasClass) {
                    element.addClass(className);
                } else {
                    element.removeClass(className);
                }
            }
        });
        binders.style = Binder.extend({
            refresh: function (key) {
                this.element.style[key] = this.bindings.style[key].get() || '';
            }
        });
        binders.enabled = Binder.extend({
            refresh: function () {
                if (this.bindings.enabled.get()) {
                    this.element.removeAttribute('disabled');
                } else {
                    this.element.setAttribute('disabled', 'disabled');
                }
            }
        });
        binders.readonly = Binder.extend({
            refresh: function () {
                if (this.bindings.readonly.get()) {
                    this.element.setAttribute('readonly', 'readonly');
                } else {
                    this.element.removeAttribute('readonly');
                }
            }
        });
        binders.disabled = Binder.extend({
            refresh: function () {
                if (this.bindings.disabled.get()) {
                    this.element.setAttribute('disabled', 'disabled');
                } else {
                    this.element.removeAttribute('disabled');
                }
            }
        });
        binders.events = Binder.extend({
            init: function (element, bindings, options) {
                Binder.fn.init.call(this, element, bindings, options);
                this.handlers = {};
            },
            refresh: function (key) {
                var element = $(this.element), binding = this.bindings.events[key], handler = this.handlers[key];
                if (handler) {
                    element.off(key, handler);
                }
                handler = this.handlers[key] = binding.get();
                element.on(key, binding.source, handler);
            },
            destroy: function () {
                var element = $(this.element), handler;
                for (handler in this.handlers) {
                    element.off(handler, this.handlers[handler]);
                }
            }
        });
        binders.text = Binder.extend({
            refresh: function () {
                var text = this.bindings.text.get();
                var dataFormat = this.element.getAttribute('data-' + quilt.ns + 'format') || '';
                if (text == null) {
                    text = '';
                }
                $(this.element).text(quilt.toString(text, dataFormat));
            }
        });
        binders.visible = Binder.extend({
            refresh: function () {
                if (this.bindings.visible.get()) {
                    this.element.style.display = '';
                } else {
                    this.element.style.display = 'none';
                }
            }
        });
        binders.invisible = Binder.extend({
            refresh: function () {
                if (!this.bindings.invisible.get()) {
                    this.element.style.display = '';
                } else {
                    this.element.style.display = 'none';
                }
            }
        });
        binders.html = Binder.extend({
            refresh: function () {
                this.element.innerHTML = this.bindings.html.get();
            }
        });
        binders.value = TypedBinder.extend({
            init: function (element, bindings, options) {
                TypedBinder.fn.init.call(this, element, bindings, options);
                this._change = proxy(this.change, this);
                this.eventName = options.valueUpdate || CHANGE;
                $(this.element).on(this.eventName, this._change);
                this._initChange = false;
            },
            change: function () {
                this._initChange = this.eventName != CHANGE;
                this.bindings[VALUE].set(this.parsedValue());
                this._initChange = false;
            },
            refresh: function () {
                if (!this._initChange) {
                    var value = this.bindings[VALUE].get();
                    if (value == null) {
                        value = '';
                    }
                    var type = this.dataType();
                    if (type == 'date') {
                        value = quilt.toString(value, 'yyyy-MM-dd');
                    } else if (type == 'datetime-local') {
                        value = quilt.toString(value, 'yyyy-MM-ddTHH:mm:ss');
                    }
                    this.element.value = value;
                }
                this._initChange = false;
            },
            destroy: function () {
                $(this.element).off(this.eventName, this._change);
            }
        });
        binders.source = Binder.extend({
            init: function (element, bindings, options) {
                Binder.fn.init.call(this, element, bindings, options);
                var source = this.bindings.source.get();
                if (source instanceof quilt.data.DataSource && options.autoBind !== false) {
                    source.fetch();
                }
            },
            refresh: function (e) {
                var that = this, source = that.bindings.source.get();
                if (source instanceof ObservableArray || source instanceof quilt.data.DataSource) {
                    e = e || {};
                    if (e.action == 'add') {
                        that.add(e.index, e.items);
                    } else if (e.action == 'remove') {
                        that.remove(e.index, e.items);
                    } else if (e.action != 'itemchange') {
                        that.render();
                    }
                } else {
                    that.render();
                }
            },
            container: function () {
                var element = this.element;
                if (element.nodeName.toLowerCase() == 'table') {
                    if (!element.tBodies[0]) {
                        element.appendChild(document.createElement('tbody'));
                    }
                    element = element.tBodies[0];
                }
                return element;
            },
            template: function () {
                var options = this.options, template = options.template, nodeName = this.container().nodeName.toLowerCase();
                if (!template) {
                    if (nodeName == 'select') {
                        if (options.valueField || options.textField) {
                            template = quilt.format('<option value="#:{0}#">#:{1}#</option>', options.valueField || options.textField, options.textField || options.valueField);
                        } else {
                            template = '<option>#:data#</option>';
                        }
                    } else if (nodeName == 'tbody') {
                        template = '<tr><td>#:data#</td></tr>';
                    } else if (nodeName == 'ul' || nodeName == 'ol') {
                        template = '<li>#:data#</li>';
                    } else {
                        template = '#:data#';
                    }
                    template = quilt.template(template);
                }
                return template;
            },
            add: function (index, items) {
                var element = this.container(), parents, idx, length, child, clone = element.cloneNode(false), reference = element.children[index];
                $(clone).html(quilt.render(this.template(), items));
                if (clone.children.length) {
                    parents = this.bindings.source._parents();
                    for (idx = 0, length = items.length; idx < length; idx++) {
                        child = clone.children[0];
                        element.insertBefore(child, reference || null);
                        bindElement(child, items[idx], this.options.roles, [items[idx]].concat(parents));
                    }
                }
            },
            remove: function (index, items) {
                var idx, element = this.container();
                for (idx = 0; idx < items.length; idx++) {
                    var child = element.children[index];
                    unbindElementTree(child, true);
                    if (child.parentNode == element) {
                        element.removeChild(child);
                    }
                }
            },
            render: function () {
                var source = this.bindings.source.get(), parents, idx, length, element = this.container(), template = this.template();
                if (source == null) {
                    return;
                }
                if (source instanceof quilt.data.DataSource) {
                    source = source.view();
                }
                if (!(source instanceof ObservableArray) && toString.call(source) !== '[object Array]') {
                    source = [source];
                }
                if (this.bindings.template) {
                    unbindElementChildren(element, true);
                    $(element).html(this.bindings.template.render(source));
                    if (element.children.length) {
                        parents = this.bindings.source._parents();
                        for (idx = 0, length = source.length; idx < length; idx++) {
                            bindElement(element.children[idx], source[idx], this.options.roles, [source[idx]].concat(parents));
                        }
                    }
                } else {
                    $(element).html(quilt.render(template, source));
                }
            }
        });
        binders.input = {
            checked: TypedBinder.extend({
                init: function (element, bindings, options) {
                    TypedBinder.fn.init.call(this, element, bindings, options);
                    this._change = proxy(this.change, this);
                    $(this.element).change(this._change);
                },
                change: function () {
                    var element = this.element;
                    var value = this.value();
                    if (element.type == 'radio') {
                        value = this.parsedValue();
                        this.bindings[CHECKED].set(value);
                    } else if (element.type == 'checkbox') {
                        var source = this.bindings[CHECKED].get();
                        var index;
                        if (source instanceof ObservableArray) {
                            value = this.parsedValue();
                            if (value instanceof Date) {
                                for (var i = 0; i < source.length; i++) {
                                    if (source[i] instanceof Date && +source[i] === +value) {
                                        index = i;
                                        break;
                                    }
                                }
                            } else {
                                index = source.indexOf(value);
                            }
                            if (index > -1) {
                                source.splice(index, 1);
                            } else {
                                source.push(value);
                            }
                        } else {
                            this.bindings[CHECKED].set(value);
                        }
                    }
                },
                refresh: function () {
                    var value = this.bindings[CHECKED].get(), source = value, type = this.dataType(), element = this.element;
                    if (element.type == 'checkbox') {
                        if (source instanceof ObservableArray) {
                            var index = -1;
                            value = this.parsedValue();
                            if (value instanceof Date) {
                                for (var i = 0; i < source.length; i++) {
                                    if (source[i] instanceof Date && +source[i] === +value) {
                                        index = i;
                                        break;
                                    }
                                }
                            } else {
                                index = source.indexOf(value);
                            }
                            element.checked = index >= 0;
                        } else {
                            element.checked = source;
                        }
                    } else if (element.type == 'radio') {
                        if (type == 'date') {
                            value = quilt.toString(value, 'yyyy-MM-dd');
                        } else if (type == 'datetime-local') {
                            value = quilt.toString(value, 'yyyy-MM-ddTHH:mm:ss');
                        }
                        if (value !== null && typeof value !== 'undefined' && element.value === value.toString()) {
                            element.checked = true;
                        } else {
                            element.checked = false;
                        }
                    }
                },
                value: function () {
                    var element = this.element, value = element.value;
                    if (element.type == 'checkbox') {
                        value = element.checked;
                    }
                    return value;
                },
                destroy: function () {
                    $(this.element).off(CHANGE, this._change);
                }
            })
        };
        binders.select = {
            source: binders.source.extend({
                refresh: function (e) {
                    var that = this, source = that.bindings.source.get();
                    if (source instanceof ObservableArray || source instanceof quilt.data.DataSource) {
                        e = e || {};
                        if (e.action == 'add') {
                            that.add(e.index, e.items);
                        } else if (e.action == 'remove') {
                            that.remove(e.index, e.items);
                        } else if (e.action == 'itemchange' || e.action === undefined) {
                            that.render();
                            if (that.bindings.value) {
                                if (that.bindings.value) {
                                    var val = retrievePrimitiveValues(that.bindings.value.get(), $(that.element).data('valueField'));
                                    if (val === null) {
                                        that.element.selectedIndex = -1;
                                    } else {
                                        that.element.value = val;
                                    }
                                }
                            }
                        }
                    } else {
                        that.render();
                    }
                }
            }),
            value: TypedBinder.extend({
                init: function (target, bindings, options) {
                    TypedBinder.fn.init.call(this, target, bindings, options);
                    this._change = proxy(this.change, this);
                    $(this.element).change(this._change);
                },
                parsedValue: function () {
                    var dataType = this.dataType();
                    var values = [];
                    var value, option, idx, length;
                    for (idx = 0, length = this.element.options.length; idx < length; idx++) {
                        option = this.element.options[idx];
                        if (option.selected) {
                            value = option.attributes.value;
                            if (value && value.specified) {
                                value = option.value;
                            } else {
                                value = option.text;
                            }
                            values.push(this._parseValue(value, dataType));
                        }
                    }
                    return values;
                },
                change: function () {
                    var values = [], element = this.element, source, field = this.options.valueField || this.options.textField, valuePrimitive = this.options.valuePrimitive, option, valueIndex, value, idx, length;
                    for (idx = 0, length = element.options.length; idx < length; idx++) {
                        option = element.options[idx];
                        if (option.selected) {
                            value = option.attributes.value;
                            if (value && value.specified) {
                                value = option.value;
                            } else {
                                value = option.text;
                            }
                            if (field) {
                                values.push(value);
                            } else {
                                values.push(this._parseValue(value, this.dataType()));
                            }
                        }
                    }
                    if (field) {
                        source = this.bindings.source.get();
                        if (source instanceof quilt.data.DataSource) {
                            source = source.view();
                        }
                        for (valueIndex = 0; valueIndex < values.length; valueIndex++) {
                            for (idx = 0, length = source.length; idx < length; idx++) {
                                var sourceValue = source[idx].get(field);
                                var match = String(sourceValue) === values[valueIndex];
                                if (match) {
                                    values[valueIndex] = source[idx];
                                    break;
                                }
                            }
                        }
                    }
                    value = this.bindings[VALUE].get();
                    if (value instanceof ObservableArray) {
                        value.splice.apply(value, [
                            0,
                            value.length
                        ].concat(values));
                    } else if (!valuePrimitive && (value instanceof ObservableObject || value === null || value === undefined || !field)) {
                        this.bindings[VALUE].set(values[0]);
                    } else {
                        this.bindings[VALUE].set(values[0].get(field));
                    }
                },
                refresh: function () {
                    var optionIndex, element = this.element, options = element.options, value = this.bindings[VALUE].get(), values = value, field = this.options.valueField || this.options.textField, found = false, type = this.dataType(), optionValue;
                    if (!(values instanceof ObservableArray)) {
                        values = new ObservableArray([value]);
                    }
                    element.selectedIndex = -1;
                    for (var valueIndex = 0; valueIndex < values.length; valueIndex++) {
                        value = values[valueIndex];
                        if (field && value instanceof ObservableObject) {
                            value = value.get(field);
                        }
                        if (type == 'date') {
                            value = quilt.toString(values[valueIndex], 'yyyy-MM-dd');
                        } else if (type == 'datetime-local') {
                            value = quilt.toString(values[valueIndex], 'yyyy-MM-ddTHH:mm:ss');
                        }
                        for (optionIndex = 0; optionIndex < options.length; optionIndex++) {
                            optionValue = options[optionIndex].value;
                            if (optionValue === '' && value !== '') {
                                optionValue = options[optionIndex].text;
                            }
                            if (value != null && optionValue == value.toString()) {
                                options[optionIndex].selected = true;
                                found = true;
                            }
                        }
                    }
                },
                destroy: function () {
                    $(this.element).off(CHANGE, this._change);
                }
            })
        };
        function dataSourceBinding(bindingName, fieldName, setter) {
            return Binder.extend({
                init: function (widget, bindings, options) {
                    var that = this;
                    Binder.fn.init.call(that, widget.element[0], bindings, options);
                    that.widget = widget;
                    that._dataBinding = proxy(that.dataBinding, that);
                    that._dataBound = proxy(that.dataBound, that);
                    that._itemChange = proxy(that.itemChange, that);
                },
                itemChange: function (e) {
                    bindElement(e.item[0], e.data, this._ns(e.ns), [e.data].concat(this.bindings[bindingName]._parents()));
                },
                dataBinding: function (e) {
                    var idx, length, widget = this.widget, items = e.removedItems || widget.items();
                    for (idx = 0, length = items.length; idx < length; idx++) {
                        unbindElementTree(items[idx], false);
                    }
                },
                _ns: function (ns) {
                    ns = ns || quilt.ui;
                    var all = [
                        quilt.ui,
                        quilt.dataviz.ui,
                        quilt.mobile.ui
                    ];
                    all.splice($.inArray(ns, all), 1);
                    all.unshift(ns);
                    return quilt.rolesFromNamespaces(all);
                },
                dataBound: function (e) {
                    var idx, length, widget = this.widget, items = e.addedItems || widget.items(), dataSource = widget[fieldName], view, parents, hds = quilt.data.HierarchicalDataSource;
                    if (hds && dataSource instanceof hds) {
                        return;
                    }
                    if (items.length) {
                        view = e.addedDataItems || dataSource.flatView();
                        parents = this.bindings[bindingName]._parents();
                        for (idx = 0, length = view.length; idx < length; idx++) {
                            if (items[idx]) {
                                bindElement(items[idx], view[idx], this._ns(e.ns), [view[idx]].concat(parents));
                            }
                        }
                    }
                },
                refresh: function (e) {
                    var that = this, source, widget = that.widget, select, multiselect, dropdowntree;
                    e = e || {};
                    if (!e.action) {
                        that.destroy();
                        widget.bind('dataBinding', that._dataBinding);
                        widget.bind('dataBound', that._dataBound);
                        widget.bind('itemChange', that._itemChange);
                        source = that.bindings[bindingName].get();
                        if (widget[fieldName] instanceof quilt.data.DataSource && widget[fieldName] != source) {
                            if (source instanceof quilt.data.DataSource) {
                                widget[setter](source);
                            } else if (source && source._dataSource) {
                                widget[setter](source._dataSource);
                            } else {
                                select = quilt.ui.Select && widget instanceof quilt.ui.Select;
                                multiselect = quilt.ui.MultiSelect && widget instanceof quilt.ui.MultiSelect;
                                dropdowntree = quilt.ui.DropDownTree && widget instanceof quilt.ui.DropDownTree;
                                if (!dropdowntree) {
                                    widget[fieldName].data(source);
                                } else {
                                    widget.treeview[fieldName].data(source);
                                }
                                if (that.bindings.value && (select || multiselect)) {
                                    widget.value(retrievePrimitiveValues(that.bindings.value.get(), widget.options.dataValueField));
                                }
                            }
                        }
                    }
                },
                destroy: function () {
                    var widget = this.widget;
                    widget.unbind('dataBinding', this._dataBinding);
                    widget.unbind('dataBound', this._dataBound);
                    widget.unbind('itemChange', this._itemChange);
                }
            });
        }
        binders.widget = {
            events: Binder.extend({
                init: function (widget, bindings, options) {
                    Binder.fn.init.call(this, widget.element[0], bindings, options);
                    this.widget = widget;
                    this.handlers = {};
                },
                refresh: function (key) {
                    var binding = this.bindings.events[key], handler = this.handlers[key];
                    if (handler) {
                        this.widget.unbind(key, handler);
                    }
                    handler = binding.get();
                    this.handlers[key] = function (e) {
                        e.data = binding.source;
                        handler(e);
                        if (e.data === binding.source) {
                            delete e.data;
                        }
                    };
                    this.widget.bind(key, this.handlers[key]);
                },
                destroy: function () {
                    var handler;
                    for (handler in this.handlers) {
                        this.widget.unbind(handler, this.handlers[handler]);
                    }
                }
            }),
            checked: Binder.extend({
                init: function (widget, bindings, options) {
                    Binder.fn.init.call(this, widget.element[0], bindings, options);
                    this.widget = widget;
                    this._change = proxy(this.change, this);
                    this.widget.bind(CHANGE, this._change);
                },
                change: function () {
                    this.bindings[CHECKED].set(this.value());
                },
                refresh: function () {
                    this.widget.check(this.bindings[CHECKED].get() === true);
                },
                value: function () {
                    var element = this.element, value = element.value;
                    if (value == 'on' || value == 'off' || this.element.type == 'checkbox') {
                        value = element.checked;
                    }
                    return value;
                },
                destroy: function () {
                    this.widget.unbind(CHANGE, this._change);
                }
            }),
            start: Binder.extend({
                init: function (widget, bindings, options) {
                    Binder.fn.init.call(this, widget.element[0], bindings, options);
                    this._change = proxy(this.change, this);
                    this.widget = widget;
                    this.widget.bind(CHANGE, this._change);
                },
                change: function () {
                    this.bindings.start.set(this.widget.range().start);
                },
                refresh: function () {
                    var that = this;
                    var start = this.bindings.start.get();
                    var end = that.widget._range ? that.widget._range.end : null;
                    this.widget.range({
                        start: start,
                        end: end
                    });
                },
                destroy: function () {
                    this.widget.unbind(CHANGE, this._change);
                }
            }),
            end: Binder.extend({
                init: function (widget, bindings, options) {
                    Binder.fn.init.call(this, widget.element[0], bindings, options);
                    this._change = proxy(this.change, this);
                    this.widget = widget;
                    this.widget.bind(CHANGE, this._change);
                },
                change: function () {
                    this.bindings.end.set(this.widget.range().end);
                },
                refresh: function () {
                    var that = this;
                    var end = this.bindings.end.get();
                    var start = that.widget._range ? that.widget._range.start : null;
                    this.widget.range({
                        start: start,
                        end: end
                    });
                },
                destroy: function () {
                    this.widget.unbind(CHANGE, this._change);
                }
            }),
            visible: Binder.extend({
                init: function (widget, bindings, options) {
                    Binder.fn.init.call(this, widget.element[0], bindings, options);
                    this.widget = widget;
                },
                refresh: function () {
                    var visible = this.bindings.visible.get();
                    this.widget.wrapper[0].style.display = visible ? '' : 'none';
                }
            }),
            invisible: Binder.extend({
                init: function (widget, bindings, options) {
                    Binder.fn.init.call(this, widget.element[0], bindings, options);
                    this.widget = widget;
                },
                refresh: function () {
                    var invisible = this.bindings.invisible.get();
                    this.widget.wrapper[0].style.display = invisible ? 'none' : '';
                }
            }),
            enabled: Binder.extend({
                init: function (widget, bindings, options) {
                    Binder.fn.init.call(this, widget.element[0], bindings, options);
                    this.widget = widget;
                },
                refresh: function () {
                    if (this.widget.enable) {
                        this.widget.enable(this.bindings.enabled.get());
                    }
                }
            }),
            disabled: Binder.extend({
                init: function (widget, bindings, options) {
                    Binder.fn.init.call(this, widget.element[0], bindings, options);
                    this.widget = widget;
                },
                refresh: function () {
                    if (this.widget.enable) {
                        this.widget.enable(!this.bindings.disabled.get());
                    }
                }
            }),
            source: dataSourceBinding('source', 'dataSource', 'setDataSource'),
            value: Binder.extend({
                init: function (widget, bindings, options) {
                    Binder.fn.init.call(this, widget.element[0], bindings, options);
                    this.widget = widget;
                    this._change = $.proxy(this.change, this);
                    this.widget.first(CHANGE, this._change);
                    var value = this.bindings.value.get();
                    this._valueIsObservableObject = !options.valuePrimitive && (value == null || value instanceof ObservableObject);
                    this._valueIsObservableArray = value instanceof ObservableArray;
                    this._initChange = false;
                },
                _source: function () {
                    var source;
                    if (this.widget.dataItem) {
                        source = this.widget.dataItem();
                        if (source && source instanceof ObservableObject) {
                            return [source];
                        }
                    }
                    if (this.bindings.source) {
                        source = this.bindings.source.get();
                    }
                    if (!source || source instanceof quilt.data.DataSource) {
                        source = this.widget.dataSource.flatView();
                    }
                    return source;
                },
                change: function () {
                    var value = this.widget.value(), field = this.options.dataValueField || this.options.dataTextField, isArray = toString.call(value) === '[object Array]', isObservableObject = this._valueIsObservableObject, valueIndex, valueLength, values = [], sourceItem, sourceValue, idx, length, source;
                    this._initChange = true;
                    if (field) {
                        if (value === '' && (isObservableObject || this.options.valuePrimitive)) {
                            value = null;
                        } else {
                            source = this._source();
                            if (isArray) {
                                valueLength = value.length;
                                values = value.slice(0);
                            }
                            for (idx = 0, length = source.length; idx < length; idx++) {
                                sourceItem = source[idx];
                                sourceValue = sourceItem.get(field);
                                if (isArray) {
                                    for (valueIndex = 0; valueIndex < valueLength; valueIndex++) {
                                        if (sourceValue == values[valueIndex]) {
                                            values[valueIndex] = sourceItem;
                                            break;
                                        }
                                    }
                                } else if (sourceValue == value) {
                                    value = isObservableObject ? sourceItem : sourceValue;
                                    break;
                                }
                            }
                            if (values[0]) {
                                if (this._valueIsObservableArray) {
                                    value = values;
                                } else if (isObservableObject || !field) {
                                    value = values[0];
                                } else {
                                    value = values[0].get(field);
                                }
                            }
                        }
                    }
                    this.bindings.value.set(value);
                    this._initChange = false;
                },
                refresh: function () {
                    if (!this._initChange) {
                        var widget = this.widget;
                        var options = widget.options;
                        var textField = options.dataTextField;
                        var valueField = options.dataValueField || textField;
                        var value = this.bindings.value.get();
                        var text = options.text || '';
                        var idx = 0, length;
                        var values = [];
                        if (value === undefined) {
                            value = null;
                        }
                        if (valueField) {
                            if (value instanceof ObservableArray) {
                                for (length = value.length; idx < length; idx++) {
                                    values[idx] = value[idx].get(valueField);
                                }
                                value = values;
                            } else if (value instanceof ObservableObject) {
                                text = value.get(textField);
                                value = value.get(valueField);
                            }
                        }
                        if (options.autoBind === false && !options.cascadeFrom && widget.listView && !widget.listView.bound()) {
                            if (textField === valueField && !text) {
                                text = value;
                            }
                            if (!text && (value || value === 0) && options.valuePrimitive) {
                                widget.value(value);
                            } else {
                                widget._preselect(value, text);
                            }
                        } else {
                            widget.value(value);
                        }
                    }
                    this._initChange = false;
                },
                destroy: function () {
                    this.widget.unbind(CHANGE, this._change);
                }
            }),
            dropdowntree: {
                value: Binder.extend({
                    init: function (widget, bindings, options) {
                        Binder.fn.init.call(this, widget.element[0], bindings, options);
                        this.widget = widget;
                        this._change = $.proxy(this.change, this);
                        this.widget.first(CHANGE, this._change);
                        this._initChange = false;
                    },
                    change: function () {
                        var that = this, oldValues = that.bindings[VALUE].get(), valuePrimitive = that.options.valuePrimitive, selectedNode = that.widget.treeview.select(), nonPrimitiveValues = that.widget._isMultipleSelection() ? that.widget._getAllChecked() : that.widget.treeview.dataItem(selectedNode) || that.widget.value(), newValues = valuePrimitive || that.widget.options.autoBind === false ? that.widget.value() : nonPrimitiveValues;
                        var field = this.options.dataValueField || this.options.dataTextField;
                        newValues = newValues.slice ? newValues.slice(0) : newValues;
                        that._initChange = true;
                        if (oldValues instanceof ObservableArray) {
                            var remove = [];
                            var newLength = newValues.length;
                            var i = 0, j = 0;
                            var old = oldValues[i];
                            var same = false;
                            var removeIndex;
                            var newValue;
                            var found;
                            while (old !== undefined) {
                                found = false;
                                for (j = 0; j < newLength; j++) {
                                    if (valuePrimitive) {
                                        same = newValues[j] == old;
                                    } else {
                                        newValue = newValues[j];
                                        newValue = newValue.get ? newValue.get(field) : newValue;
                                        same = newValue == (old.get ? old.get(field) : old);
                                    }
                                    if (same) {
                                        newValues.splice(j, 1);
                                        newLength -= 1;
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    remove.push(old);
                                    arraySplice(oldValues, i, 1);
                                    removeIndex = i;
                                } else {
                                    i += 1;
                                }
                                old = oldValues[i];
                            }
                            arraySplice(oldValues, oldValues.length, 0, newValues);
                            if (remove.length) {
                                oldValues.trigger('change', {
                                    action: 'remove',
                                    items: remove,
                                    index: removeIndex
                                });
                            }
                            if (newValues.length) {
                                oldValues.trigger('change', {
                                    action: 'add',
                                    items: newValues,
                                    index: oldValues.length - 1
                                });
                            }
                        } else {
                            that.bindings[VALUE].set(newValues);
                        }
                        that._initChange = false;
                    },
                    refresh: function () {
                        if (!this._initChange) {
                            var options = this.options, widget = this.widget, field = options.dataValueField || options.dataTextField, value = this.bindings.value.get(), data = value, idx = 0, length, values = [], selectedValue;
                            if (field) {
                                if (value instanceof ObservableArray) {
                                    for (length = value.length; idx < length; idx++) {
                                        selectedValue = value[idx];
                                        values[idx] = selectedValue.get ? selectedValue.get(field) : selectedValue;
                                    }
                                    value = values;
                                } else if (value instanceof ObservableObject) {
                                    value = value.get(field);
                                }
                            }
                            if (options.autoBind === false && options.valuePrimitive !== true) {
                                widget._preselect(data, value);
                            } else {
                                widget.value(value);
                            }
                        }
                    },
                    destroy: function () {
                        this.widget.unbind(CHANGE, this._change);
                    }
                })
            },
            gantt: { dependencies: dataSourceBinding('dependencies', 'dependencies', 'setDependenciesDataSource') },
            multiselect: {
                value: Binder.extend({
                    init: function (widget, bindings, options) {
                        Binder.fn.init.call(this, widget.element[0], bindings, options);
                        this.widget = widget;
                        this._change = $.proxy(this.change, this);
                        this.widget.first(CHANGE, this._change);
                        this._initChange = false;
                    },
                    change: function () {
                        var that = this, oldValues = that.bindings[VALUE].get(), valuePrimitive = that.options.valuePrimitive, newValues = valuePrimitive ? that.widget.value() : that.widget.dataItems();
                        var field = this.options.dataValueField || this.options.dataTextField;
                        newValues = newValues.slice(0);
                        that._initChange = true;
                        if (oldValues instanceof ObservableArray) {
                            var remove = [];
                            var newLength = newValues.length;
                            var i = 0, j = 0;
                            var old = oldValues[i];
                            var same = false;
                            var removeIndex;
                            var newValue;
                            var found;
                            while (old !== undefined) {
                                found = false;
                                for (j = 0; j < newLength; j++) {
                                    if (valuePrimitive) {
                                        same = newValues[j] == old;
                                    } else {
                                        newValue = newValues[j];
                                        newValue = newValue.get ? newValue.get(field) : newValue;
                                        same = newValue == (old.get ? old.get(field) : old);
                                    }
                                    if (same) {
                                        newValues.splice(j, 1);
                                        newLength -= 1;
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    remove.push(old);
                                    arraySplice(oldValues, i, 1);
                                    removeIndex = i;
                                } else {
                                    i += 1;
                                }
                                old = oldValues[i];
                            }
                            arraySplice(oldValues, oldValues.length, 0, newValues);
                            if (remove.length) {
                                oldValues.trigger('change', {
                                    action: 'remove',
                                    items: remove,
                                    index: removeIndex
                                });
                            }
                            if (newValues.length) {
                                oldValues.trigger('change', {
                                    action: 'add',
                                    items: newValues,
                                    index: oldValues.length - 1
                                });
                            }
                        } else {
                            that.bindings[VALUE].set(newValues);
                        }
                        that._initChange = false;
                    },
                    refresh: function () {
                        if (!this._initChange) {
                            var options = this.options, widget = this.widget, field = options.dataValueField || options.dataTextField, value = this.bindings.value.get(), data = value, idx = 0, length, values = [], selectedValue;
                            if (value === undefined) {
                                value = null;
                            }
                            if (field) {
                                if (value instanceof ObservableArray) {
                                    for (length = value.length; idx < length; idx++) {
                                        selectedValue = value[idx];
                                        values[idx] = selectedValue.get ? selectedValue.get(field) : selectedValue;
                                    }
                                    value = values;
                                } else if (value instanceof ObservableObject) {
                                    value = value.get(field);
                                }
                            }
                            if (options.autoBind === false && options.valuePrimitive !== true && !widget._isBound()) {
                                widget._preselect(data, value);
                            } else {
                                widget.value(value);
                            }
                        }
                    },
                    destroy: function () {
                        this.widget.unbind(CHANGE, this._change);
                    }
                })
            },
            scheduler: {
                source: dataSourceBinding('source', 'dataSource', 'setDataSource').extend({
                    dataBound: function (e) {
                        var idx;
                        var length;
                        var widget = this.widget;
                        var elements = e.addedItems || widget.items();
                        var data, parents;
                        if (elements.length) {
                            data = e.addedDataItems || widget.dataItems();
                            parents = this.bindings.source._parents();
                            for (idx = 0, length = data.length; idx < length; idx++) {
                                bindElement(elements[idx], data[idx], this._ns(e.ns), [data[idx]].concat(parents));
                            }
                        }
                    }
                })
            },
            grid: {
                source: dataSourceBinding('source', 'dataSource', 'setDataSource').extend({
                    dataBound: function (e) {
                        var idx, length, widget = this.widget, elements = e.addedItems || widget.items(), parents, data;
                        if (elements.length) {
                            data = e.addedDataItems || widget.dataItems();
                            parents = this.bindings.source._parents();
                            for (idx = 0, length = data.length; idx < length; idx++) {
                                bindElement(elements[idx], data[idx], this._ns(e.ns), [data[idx]].concat(parents));
                            }
                        }
                    }
                })
            },
            badge: {
                text: Binder.extend({
                    init: function (widget, bindings, options) {
                        Binder.fn.init.call(this, widget.element[0], bindings, options);
                        this.widget = widget;
                    },
                    refresh: function () {
                        var text = this.bindings.text.get();
                        if (text == null) {
                            text = '';
                        }
                        this.widget.text(text);
                    }
                })
            }
        };
        var arraySplice = function (arr, idx, remove, add) {
            add = add || [];
            remove = remove || 0;
            var addLength = add.length;
            var oldLength = arr.length;
            var shifted = [].slice.call(arr, idx + remove);
            var shiftedLength = shifted.length;
            var index;
            if (addLength) {
                addLength = idx + addLength;
                index = 0;
                for (; idx < addLength; idx++) {
                    arr[idx] = add[index];
                    index++;
                }
                arr.length = addLength;
            } else if (remove) {
                arr.length = idx;
                remove += idx;
                while (idx < remove) {
                    delete arr[--remove];
                }
            }
            if (shiftedLength) {
                shiftedLength = idx + shiftedLength;
                index = 0;
                for (; idx < shiftedLength; idx++) {
                    arr[idx] = shifted[index];
                    index++;
                }
                arr.length = shiftedLength;
            }
            idx = arr.length;
            while (idx < oldLength) {
                delete arr[idx];
                idx++;
            }
        };
        var BindingTarget = Class.extend({
            init: function (target, options) {
                this.target = target;
                this.options = options;
                this.toDestroy = [];
            },
            bind: function (bindings) {
                var key, hasValue, hasSource, hasEvents, hasChecked, hasCss, widgetBinding = this instanceof WidgetBindingTarget, specificBinders = this.binders();
                for (key in bindings) {
                    if (key == VALUE) {
                        hasValue = true;
                    } else if (key == SOURCE) {
                        hasSource = true;
                    } else if (key == EVENTS && !widgetBinding) {
                        hasEvents = true;
                    } else if (key == CHECKED) {
                        hasChecked = true;
                    } else if (key == CSS) {
                        hasCss = true;
                    } else {
                        this.applyBinding(key, bindings, specificBinders);
                    }
                }
                if (hasSource) {
                    this.applyBinding(SOURCE, bindings, specificBinders);
                }
                if (hasValue) {
                    this.applyBinding(VALUE, bindings, specificBinders);
                }
                if (hasChecked) {
                    this.applyBinding(CHECKED, bindings, specificBinders);
                }
                if (hasEvents && !widgetBinding) {
                    this.applyBinding(EVENTS, bindings, specificBinders);
                }
                if (hasCss && !widgetBinding) {
                    this.applyBinding(CSS, bindings, specificBinders);
                }
            },
            binders: function () {
                return binders[this.target.nodeName.toLowerCase()] || {};
            },
            applyBinding: function (name, bindings, specificBinders) {
                var binder = specificBinders[name] || binders[name], toDestroy = this.toDestroy, attribute, binding = bindings[name];
                if (binder) {
                    binder = new binder(this.target, bindings, this.options);
                    toDestroy.push(binder);
                    if (binding instanceof Binding) {
                        binder.bind(binding);
                        toDestroy.push(binding);
                    } else {
                        for (attribute in binding) {
                            binder.bind(binding, attribute);
                            toDestroy.push(binding[attribute]);
                        }
                    }
                } else if (name !== 'template') {
                    throw new Error('The ' + name + ' binding is not supported by the ' + this.target.nodeName.toLowerCase() + ' element');
                }
            },
            destroy: function () {
                var idx, length, toDestroy = this.toDestroy;
                for (idx = 0, length = toDestroy.length; idx < length; idx++) {
                    toDestroy[idx].destroy();
                }
            }
        });
        var WidgetBindingTarget = BindingTarget.extend({
            binders: function () {
                return binders.widget[this.target.options.name.toLowerCase()] || {};
            },
            applyBinding: function (name, bindings, specificBinders) {
                var binder = specificBinders[name] || binders.widget[name], toDestroy = this.toDestroy, attribute, binding = bindings[name];
                if (binder) {
                    binder = new binder(this.target, bindings, this.target.options);
                    toDestroy.push(binder);
                    if (binding instanceof Binding) {
                        binder.bind(binding);
                        toDestroy.push(binding);
                    } else {
                        for (attribute in binding) {
                            binder.bind(binding, attribute);
                            toDestroy.push(binding[attribute]);
                        }
                    }
                } else {
                    throw new Error('The ' + name + ' binding is not supported by the ' + this.target.options.name + ' widget');
                }
            }
        });
        function bindingTargetForRole(element, roles) {
            var widget = quilt.initWidget(element, {}, roles);
            if (widget) {
                return new WidgetBindingTarget(widget);
            }
        }
        var keyValueRegExp = /[A-Za-z0-9_\-]+:(\{([^}]*)\}|[^,}]+)/g, whiteSpaceRegExp = /\s/g;
        function parseBindings(bind) {
            var result = {}, idx, length, token, colonIndex, key, value, tokens;
            tokens = bind.match(keyValueRegExp);
            for (idx = 0, length = tokens.length; idx < length; idx++) {
                token = tokens[idx];
                colonIndex = token.indexOf(':');
                key = token.substring(0, colonIndex);
                value = token.substring(colonIndex + 1);
                if (value.charAt(0) == '{') {
                    value = parseBindings(value);
                }
                result[key] = value;
            }
            return result;
        }
        function createBindings(bindings, source, type) {
            var binding, result = {};
            for (binding in bindings) {
                result[binding] = new type(source, bindings[binding]);
            }
            return result;
        }
        function bindElement(element, source, roles, parents) {
            if (!element || element.getAttribute('data-' + quilt.ns + 'stop')) {
                return;
            }
            var role = element.getAttribute('data-' + quilt.ns + 'role'), idx, bind = element.getAttribute('data-' + quilt.ns + 'bind'), childrenCopy = [], deep = true, bindings, options = {}, target;
            parents = parents || [source];
            if (role || bind) {
                unbindElement(element, false);
            }
            if (role) {
                target = bindingTargetForRole(element, roles);
            }
            if (bind) {
                bind = parseBindings(bind.replace(whiteSpaceRegExp, ''));
                if (!target) {
                    options = quilt.parseOptions(element, {
                        textField: '',
                        valueField: '',
                        template: '',
                        valueUpdate: CHANGE,
                        valuePrimitive: false,
                        autoBind: true
                    }, source);
                    options.roles = roles;
                    target = new BindingTarget(element, options);
                }
                target.source = source;
                bindings = createBindings(bind, parents, Binding);
                if (options.template) {
                    bindings.template = new TemplateBinding(parents, '', options.template);
                }
                if (bindings.click) {
                    bind.events = bind.events || {};
                    bind.events.click = bind.click;
                    bindings.click.destroy();
                    delete bindings.click;
                }
                if (bindings.source) {
                    deep = false;
                }
                if (bind.attr) {
                    bindings.attr = createBindings(bind.attr, parents, Binding);
                }
                if (bind.style) {
                    bindings.style = createBindings(bind.style, parents, Binding);
                }
                if (bind.events) {
                    bindings.events = createBindings(bind.events, parents, EventBinding);
                }
                if (bind.css) {
                    bindings.css = createBindings(bind.css, parents, Binding);
                }
                target.bind(bindings);
            }
            if (target) {
                element.quiltBindingTarget = target;
            }
            var children = element.children;
            if (deep && children && !element.getAttribute('data-' + quilt.ns + 'stop')) {
                for (idx = 0; idx < children.length; idx++) {
                    childrenCopy[idx] = children[idx];
                }
                for (idx = 0; idx < childrenCopy.length; idx++) {
                    bindElement(childrenCopy[idx], source, roles, parents);
                }
            }
        }
        function bind(dom, object) {
            var idx, length, node, roles = quilt.rolesFromNamespaces([].slice.call(arguments, 2));
            object = quilt.observable(object);
            dom = $(dom);
            for (idx = 0, length = dom.length; idx < length; idx++) {
                node = dom[idx];
                if (node.nodeType === 1) {
                    bindElement(node, object, roles);
                }
            }
        }
        function unbindElement(element, destroyWidget) {
            var bindingTarget = element.quiltBindingTarget;
            if (bindingTarget) {
                bindingTarget.destroy();
                if (deleteExpando) {
                    delete element.quiltBindingTarget;
                } else if (element.removeAttribute) {
                    element.removeAttribute('quiltBindingTarget');
                } else {
                    element.quiltBindingTarget = null;
                }
            }
            if (destroyWidget) {
                var widget = quilt.widgetInstance($(element));
                if (widget && typeof widget.destroy === FUNCTION) {
                    widget.destroy();
                }
            }
        }
        function unbindElementTree(element, destroyWidgets) {
            unbindElement(element, destroyWidgets);
            unbindElementChildren(element, destroyWidgets);
        }
        function unbindElementChildren(element, destroyWidgets) {
            var children = element.children;
            if (children) {
                for (var idx = 0, length = children.length; idx < length; idx++) {
                    unbindElementTree(children[idx], destroyWidgets);
                }
            }
        }
        function unbind(dom) {
            var idx, length;
            dom = $(dom);
            for (idx = 0, length = dom.length; idx < length; idx++) {
                unbindElementTree(dom[idx], false);
            }
        }
        function notify(widget, namespace) {
            var element = widget.element, bindingTarget = element[0].quiltBindingTarget;
            if (bindingTarget) {
                bind(element, bindingTarget.source, namespace);
            }
        }
        function retrievePrimitiveValues(value, valueField) {
            var values = [];
            var idx = 0;
            var length;
            var item;
            if (!valueField) {
                return value;
            }
            if (value instanceof ObservableArray) {
                for (length = value.length; idx < length; idx++) {
                    item = value[idx];
                    values[idx] = item.get ? item.get(valueField) : item[valueField];
                }
                value = values;
            } else if (value instanceof ObservableObject) {
                value = value.get(valueField);
            }
            return value;
        }
        quilt.unbind = unbind;
        quilt.bind = bind;
        quilt.data.binders = binders;
        quilt.data.Binder = Binder;
        quilt.notify = notify;
        quilt.observable = function (object) {
            if (!(object instanceof ObservableObject)) {
                object = new ObservableObject(object);
            }
            return object;
        };
        quilt.observableHierarchy = function (array) {
            var dataSource = quilt.data.HierarchicalDataSource.create(array);
            function recursiveRead(data) {
                var i, children;
                for (i = 0; i < data.length; i++) {
                    data[i]._initChildren();
                    children = data[i].children;
                    children.fetch();
                    data[i].items = children.data();
                    recursiveRead(data[i].items);
                }
            }
            dataSource.fetch();
            recursiveRead(dataSource.data());
            dataSource._data._dataSource = dataSource;
            return dataSource._data;
        };
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.validator', ['quilt.core'], f);
}(function () {
    var __meta__ = {
        id: 'validator',
        name: 'Validator',
        category: 'web',
        description: 'The Validator offers an easy way to do a client-side form validation.',
        depends: ['core']
    };
    (function ($, undefined) {
        var quilt = window.quilt, Widget = quilt.ui.Widget, NS = '.quiltValidator', INVALIDMSG = 'k-invalid-msg', invalidMsgRegExp = new RegExp(INVALIDMSG, 'i'), INVALIDINPUT = 'k-invalid', VALIDINPUT = 'k-valid', VALIDATIONSUMMARY = 'k-validation-summary', INVALIDLABEL = 'k-text-error', MESSAGEBOX = 'k-messagebox k-messagebox-error', ARIAINVALID = 'aria-invalid', ARIADESCRIBEDBY = 'aria-describedby', emailRegExp = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i, urlRegExp = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i, INPUTSELECTOR = ':input:not(:button,[type=submit],[type=reset],[disabled],[readonly])', CHECKBOXSELECTOR = ':checkbox:not([disabled],[readonly])', NUMBERINPUTSELECTOR = '[type=number],[type=range]', BLUR = 'blur', NAME = 'name', FORM = 'form', NOVALIDATE = 'novalidate', VALIDATE = 'validate', CHANGE = 'change', VALIDATE_INPUT = 'validateInput', proxy = $.proxy, patternMatcher = function (value, pattern) {
                if (typeof pattern === 'string') {
                    pattern = new RegExp('^(?:' + pattern + ')$');
                }
                return pattern.test(value);
            }, matcher = function (input, selector, pattern) {
                var value = input.val();
                if (input.filter(selector).length && value !== '') {
                    return patternMatcher(value, pattern);
                }
                return true;
            }, hasAttribute = function (input, name) {
                if (input.length) {
                    return input[0].attributes[name] != null;
                }
                return false;
            };
        if (!quilt.ui.validator) {
            quilt.ui.validator = {
                rules: {},
                messages: {},
                allowSubmit: $.noop,
                validateOnInit: $.noop
            };
        }
        function resolveRules(element) {
            var resolvers = quilt.ui.validator.ruleResolvers || {}, rules = {}, name;
            for (name in resolvers) {
                $.extend(true, rules, resolvers[name].resolve(element));
            }
            return rules;
        }
        function decode(value) {
            return value.replace(/&amp/g, '&amp;').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        }
        function numberOfDecimalDigits(value) {
            value = (value + '').split('.');
            if (value.length > 1) {
                return value[1].length;
            }
            return 0;
        }
        function parseHtml(text) {
            if ($.parseHTML) {
                return $($.parseHTML(text));
            }
            return $(text);
        }
        function searchForMessageContainer(elements, fieldName) {
            var containers = $(), element, attr;
            for (var idx = 0, length = elements.length; idx < length; idx++) {
                element = elements[idx];
                if (invalidMsgRegExp.test(element.className)) {
                    attr = element.getAttribute(quilt.attr('for'));
                    if (attr === fieldName) {
                        containers = containers.add(element);
                    }
                }
            }
            return containers;
        }
        function isLabelFor(label, element) {
            if (!label) {
                return false;
            }
            if (typeof label.nodeName !== 'string' || label.nodeName !== 'LABEL') {
                return false;
            }
            if (typeof label.getAttribute('for') !== 'string' || typeof element.getAttribute('id') !== 'string') {
                return false;
            }
            if (label.getAttribute('for') !== element.getAttribute('id')) {
                return false;
            }
            return true;
        }
        var SUMMARYTEMPLATE = '<ul>' + '#for(var i = 0; i < errors.length; i += 1){#' + '<li><a data-field="#=errors[i].field#" href="\\#">#= errors[i].message #</a></li>' + '# } #' + '</ul>';
        var Validator = Widget.extend({
            init: function (element, options) {
                var that = this, resolved = resolveRules(element), validateAttributeSelector = '[' + quilt.attr('validate') + '!=false]';
                options = options || {};
                options.rules = $.extend({}, quilt.ui.validator.rules, resolved.rules, options.rules);
                options.messages = $.extend({}, quilt.ui.validator.messages, resolved.messages, options.messages);
                Widget.fn.init.call(that, element, options);
                that._errorTemplate = quilt.template(that.options.errorTemplate);
                that._summaryTemplate = quilt.template(that.options.validationSummary.template || SUMMARYTEMPLATE);
                if (that.element.is(FORM)) {
                    that.element.attr(NOVALIDATE, NOVALIDATE);
                }
                that._inputSelector = INPUTSELECTOR + validateAttributeSelector;
                that._checkboxSelector = CHECKBOXSELECTOR + validateAttributeSelector;
                that._errors = {};
                that._attachEvents();
                that._isValidated = false;
                if (that._validateOnInit()) {
                    that.validate();
                }
            },
            events: [
                VALIDATE,
                CHANGE,
                VALIDATE_INPUT
            ],
            options: {
                name: 'Validator',
                errorTemplate: '<span class="k-form-error">#= message #</span>',
                messages: {
                    required: '{0} is required',
                    pattern: '{0} is not valid',
                    min: '{0} should be greater than or equal to {1}',
                    max: '{0} should be smaller than or equal to {1}',
                    step: '{0} is not valid',
                    email: '{0} is not valid email',
                    url: '{0} is not valid URL',
                    date: '{0} is not valid date',
                    dateCompare: 'End date should be greater than or equal to the start date'
                },
                rules: {
                    required: function (input) {
                        var noNameCheckbox = !input.attr('name') && !input.is(':checked'), namedCheckbox = input.attr('name') && !this.element.find('input[name=\'' + input.attr('name') + '\']:checked').length, checkbox = input.filter('[type=checkbox]').length && (noNameCheckbox || namedCheckbox), radio = input.filter('[type=radio]').length && !this.element.find('input[name=\'' + input.attr('name') + '\']:checked').length, value = input.val();
                        return !(hasAttribute(input, 'required') && (!value || value === '' || value.length === 0 || checkbox || radio));
                    },
                    pattern: function (input) {
                        if (input.filter('[type=text],[type=email],[type=url],[type=tel],[type=search],[type=password]').filter('[pattern]').length && input.val() !== '') {
                            return patternMatcher(input.val(), input.attr('pattern'));
                        }
                        return true;
                    },
                    min: function (input) {
                        if (input.filter(NUMBERINPUTSELECTOR + ',[' + quilt.attr('type') + '=number]').filter('[min]').length && input.val() !== '') {
                            var min = parseFloat(input.attr('min')) || 0, val = quilt.parseFloat(input.val());
                            return min <= val;
                        }
                        return true;
                    },
                    max: function (input) {
                        if (input.filter(NUMBERINPUTSELECTOR + ',[' + quilt.attr('type') + '=number]').filter('[max]').length && input.val() !== '') {
                            var max = parseFloat(input.attr('max')) || 0, val = quilt.parseFloat(input.val());
                            return max >= val;
                        }
                        return true;
                    },
                    step: function (input) {
                        if (input.filter(NUMBERINPUTSELECTOR + ',[' + quilt.attr('type') + '=number]').filter('[step]').length && input.val() !== '') {
                            var min = parseFloat(input.attr('min')) || 0, step = parseFloat(input.attr('step')) || 1, val = parseFloat(input.val()), decimals = numberOfDecimalDigits(step), raise;
                            if (decimals) {
                                raise = Math.pow(10, decimals);
                                return Math.floor((val - min) * raise) % (step * raise) / Math.pow(100, decimals) === 0;
                            }
                            return (val - min) % step === 0;
                        }
                        return true;
                    },
                    email: function (input) {
                        return matcher(input, '[type=email],[' + quilt.attr('type') + '=email]', emailRegExp);
                    },
                    url: function (input) {
                        return matcher(input, '[type=url],[' + quilt.attr('type') + '=url]', urlRegExp);
                    },
                    date: function (input) {
                        if (input.filter('[type^=date],[' + quilt.attr('type') + '=date]').length && input.val() !== '') {
                            return quilt.parseDate(input.val(), input.attr(quilt.attr('format'))) !== null;
                        }
                        return true;
                    }
                },
                validateOnBlur: true,
                validationSummary: false
            },
            _allowSubmit: function () {
                return quilt.ui.validator.allowSubmit(this.element, this.errors());
            },
            _validateOnInit: function () {
                return quilt.ui.validator.validateOnInit(this.element);
            },
            destroy: function () {
                Widget.fn.destroy.call(this);
                this.element.off(NS);
                if (this.validationSummary) {
                    this.validationSummary.off(NS);
                    this.validationSummary = null;
                }
            },
            value: function () {
                if (!this._isValidated) {
                    return false;
                }
                return this.errors().length === 0;
            },
            _submit: function (e) {
                if (!this.validate() && !this._allowSubmit()) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return false;
                }
                return true;
            },
            _checkElement: function (element) {
                var state = this.value();
                this.validateInput(element);
                if (this.value() !== state) {
                    this.trigger(CHANGE);
                }
            },
            _attachEvents: function () {
                var that = this;
                if (that.element.is(FORM)) {
                    that.element.on('submit' + NS, proxy(that._submit, that));
                }
                if (that.options.validateOnBlur) {
                    if (!that.element.is(INPUTSELECTOR)) {
                        that.element.on(BLUR + NS, that._inputSelector, function () {
                            that._checkElement($(this));
                        });
                        that.element.on('click' + NS, that._checkboxSelector, function () {
                            that._checkElement($(this));
                        });
                    } else {
                        that.element.on(BLUR + NS, function () {
                            that._checkElement(that.element);
                        });
                        if (that.element.is(CHECKBOXSELECTOR)) {
                            that.element.on('click' + NS, function () {
                                that._checkElement(that.element);
                            });
                        }
                    }
                }
            },
            validate: function () {
                var inputs;
                var idx;
                var result = false;
                var length;
                var isValid = this.value();
                this._errors = {};
                if (!this.element.is(INPUTSELECTOR)) {
                    var invalid = false;
                    inputs = this.element.find(this._inputSelector);
                    for (idx = 0, length = inputs.length; idx < length; idx++) {
                        if (!this.validateInput(inputs.eq(idx))) {
                            invalid = true;
                        }
                    }
                    result = !invalid;
                } else {
                    result = this.validateInput(this.element);
                }
                if (this.options.validationSummary && !isValid) {
                    this.showValidationSummary();
                }
                this.trigger(VALIDATE, {
                    valid: result,
                    errors: this.errors()
                });
                if (isValid !== result) {
                    this.trigger(CHANGE);
                }
                return result;
            },
            validateInput: function (input) {
                input = $(input);
                this._isValidated = true;
                var that = this, template = that._errorTemplate, result = that._checkValidity(input), valid = result.valid, className = '.' + INVALIDMSG, fieldName = input.attr(NAME) || '', lbl = that._findMessageContainer(fieldName).add(input.next(className).filter(function () {
                        var element = $(this);
                        if (element.filter('[' + quilt.attr('for') + ']').length) {
                            return element.attr(quilt.attr('for')) === fieldName;
                        }
                        return true;
                    })).addClass('k-hidden'), messageText = !valid ? that._extractMessage(input, result.key) : '', messageLabel = !valid ? parseHtml(template({
                        message: decode(messageText),
                        field: fieldName
                    })) : '', wasValid = !input.attr(ARIAINVALID);
                input.removeAttr(ARIAINVALID);
                if (!valid) {
                    that._errors[fieldName] = messageText;
                    var lblId = lbl.attr('id');
                    that._decorateMessageContainer(messageLabel, fieldName);
                    if (lblId) {
                        messageLabel.attr('id', lblId);
                    }
                    if (lbl.length !== 0) {
                        lbl.replaceWith(messageLabel);
                    } else {
                        var widgetInstance = quilt.widgetInstance(input);
                        var parentElement = input.parent().get(0);
                        var nextElement = input.next().get(0);
                        var prevElement = input.prev().get(0);
                        if (!widgetInstance && input.is('[type=radio]')) {
                            widgetInstance = quilt.widgetInstance(input.closest('.k-radio-list'));
                        }
                        if (!widgetInstance && input.is('[type=checkbox]')) {
                            widgetInstance = quilt.widgetInstance(input.closest('.k-checkbox-list'));
                        }
                        if (widgetInstance && widgetInstance.wrapper) {
                            messageLabel.insertAfter(widgetInstance.wrapper);
                        } else if (parentElement && parentElement.nodeName === 'LABEL') {
                            messageLabel.insertAfter(parentElement);
                        } else if (nextElement && isLabelFor(nextElement, input[0])) {
                            messageLabel.insertAfter(nextElement);
                        } else if (prevElement && isLabelFor(prevElement, input[0])) {
                            messageLabel.insertAfter(input);
                        } else {
                            messageLabel.insertAfter(input);
                        }
                    }
                    messageLabel.removeClass('k-hidden');
                    input.attr(ARIAINVALID, true);
                } else {
                    delete that._errors[fieldName];
                }
                if (wasValid !== valid) {
                    this.trigger(VALIDATE_INPUT, {
                        valid: valid,
                        input: input,
                        error: messageText,
                        field: fieldName
                    });
                }
                input.toggleClass(INVALIDINPUT, !valid);
                input.toggleClass(VALIDINPUT, valid);
                if (quilt.widgetInstance(input)) {
                    var inputWrap = quilt.widgetInstance(input)._inputWrapper;
                    var inputLabel = quilt.widgetInstance(input)._inputLabel;
                    if (inputWrap) {
                        inputWrap.toggleClass(INVALIDINPUT, !valid);
                        inputWrap.toggleClass(VALIDINPUT, valid);
                    }
                    if (inputLabel) {
                        inputLabel.toggleClass(INVALIDLABEL, !valid);
                    }
                }
                if (wasValid !== valid) {
                    var errorId = messageLabel ? messageLabel.attr('id') : lbl.attr('id');
                    that._associateMessageContainer(input, errorId);
                    if (this.options.validationSummary && this.options.validateOnBlur) {
                        this.showValidationSummary();
                    }
                }
                return valid;
            },
            hideMessages: function () {
                var that = this, className = '.' + INVALIDMSG, element = that.element;
                that._disassociateMessageContainers();
                if (!element.is(INPUTSELECTOR)) {
                    element.find(className).addClass('k-hidden');
                } else {
                    element.next(className).addClass('k-hidden');
                }
            },
            reset: function () {
                var that = this, inputs = that.element.find('.' + INVALIDINPUT), labels = that.element.find('.' + INVALIDLABEL);
                that._errors = [];
                that.hideMessages();
                that.hideValidationSummary();
                inputs.removeAttr(ARIAINVALID);
                inputs.removeClass(INVALIDINPUT);
                labels.removeClass(INVALIDLABEL);
            },
            _findMessageContainer: function (fieldName) {
                var locators = quilt.ui.validator.messageLocators, name, containers = $();
                for (var idx = 0, length = this.element.length; idx < length; idx++) {
                    containers = containers.add(searchForMessageContainer(this.element[idx].getElementsByTagName('*'), fieldName));
                }
                for (name in locators) {
                    containers = containers.add(locators[name].locate(this.element, fieldName));
                }
                return containers;
            },
            _decorateMessageContainer: function (container, fieldName) {
                var locators = quilt.ui.validator.messageLocators, name;
                container.addClass(INVALIDMSG).attr(quilt.attr('for'), fieldName || '');
                if (!container.attr('id')) {
                    container.attr('id', fieldName + '-error');
                }
                for (name in locators) {
                    locators[name].decorate(container, fieldName);
                }
            },
            _extractMessage: function (input, ruleKey) {
                var that = this, customMessage = that.options.messages[ruleKey], fieldName = input.attr(NAME), nonDefaultMessage;
                if (!quilt.ui.Validator.prototype.options.messages[ruleKey]) {
                    nonDefaultMessage = quilt.isFunction(customMessage) ? customMessage(input) : customMessage;
                }
                customMessage = quilt.isFunction(customMessage) ? customMessage(input) : customMessage;
                return quilt.format(input.attr(quilt.attr(ruleKey + '-msg')) || input.attr('validationMessage') || nonDefaultMessage || customMessage || input.attr('title') || '', fieldName, input.attr(ruleKey) || input.attr(quilt.attr(ruleKey)));
            },
            _checkValidity: function (input) {
                var rules = this.options.rules, rule;
                for (rule in rules) {
                    if (!rules[rule].call(this, input)) {
                        return {
                            valid: false,
                            key: rule
                        };
                    }
                }
                return { valid: true };
            },
            errors: function () {
                var results = [], errors = this._errors, error;
                for (error in errors) {
                    results.push(errors[error]);
                }
                return results;
            },
            setOptions: function (options) {
                if (options.validationSummary) {
                    this.hideValidationSummary();
                }
                quilt.deepExtend(this.options, options);
                this.destroy();
                this.init(this.element, this.options);
                this._setEvents(this.options);
            },
            _getInputNames: function () {
                var that = this, inputs = that.element.find(that._inputSelector), sorted = [];
                for (var idx = 0, length = inputs.length; idx < length; idx++) {
                    var input = $(inputs[idx]);
                    if (hasAttribute(input, NAME)) {
                        if (sorted.indexOf(input.attr(NAME)) === -1 || input.closest('.k-checkbox-list').length === 0 && input.closest('.k-radio-list').length === 0) {
                            sorted.push(input.attr(NAME));
                        }
                    }
                }
                return sorted;
            },
            _associateMessageContainer: function (input, errorId) {
                var nextFocusable = quilt.getWidgetFocusableElement(input);
                if (!nextFocusable || !errorId) {
                    return;
                }
                quilt.toggleAttribute(nextFocusable, ARIADESCRIBEDBY, errorId);
            },
            _disassociateMessageContainers: function () {
                var that = this, inputs = that.element.find('.' + INVALIDINPUT).addBack(), input, errorId;
                for (var i = 0; i < inputs.length; i += 1) {
                    input = $(inputs[i]);
                    if (input.is('input')) {
                        errorId = that._findMessageContainer(input.attr(NAME)).add(input.next('.' + INVALIDMSG)).attr('id');
                        that._associateMessageContainer(input, errorId);
                    }
                }
            },
            _errorsByName: function () {
                var that = this, inputNames = that._getInputNames(), sorted = [];
                for (var i = 0; i < inputNames.length; i += 1) {
                    var name = inputNames[i];
                    if (that._errors[name]) {
                        sorted.push({
                            field: name,
                            message: that._errors[name]
                        });
                    }
                }
                return sorted;
            },
            _renderSummary: function () {
                var that = this, options = this.options.validationSummary, element = this.element, prevElement = element.prev(), container;
                if (options.container) {
                    container = $(options.container);
                } else if (prevElement && prevElement.hasClass(VALIDATIONSUMMARY)) {
                    container = prevElement;
                } else {
                    container = $('<div />').insertBefore(that.element);
                }
                container.addClass([
                    VALIDATIONSUMMARY,
                    MESSAGEBOX
                ].join(' '));
                container.attr('role', 'alert');
                container.on('click' + NS, proxy(that._summaryClick, that));
                return container;
            },
            _summaryClick: function (e) {
                e.preventDefault();
                var that = this, link = $(e.target), target = that.element.find('[name=\'' + link.data('field') + '\']'), nextFocusable;
                if (!target.length) {
                    return;
                }
                nextFocusable = quilt.getWidgetFocusableElement(target);
                if (nextFocusable) {
                    nextFocusable.focus();
                }
            },
            showValidationSummary: function () {
                var that = this, summary = that.validationSummary, errors = that._errorsByName(), errorsList;
                if (!summary) {
                    summary = that.validationSummary = that._renderSummary();
                }
                errorsList = parseHtml(that._summaryTemplate({ errors: errors }));
                summary.html(errorsList);
                summary.toggleClass('k-hidden', !errors.length);
            },
            hideValidationSummary: function () {
                var that = this, summary = that.validationSummary;
                if (!summary) {
                    return;
                }
                summary.addClass('k-hidden');
            }
        });
        quilt.ui.plugin(Validator);
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.userevents', ['quilt.core'], f);
}(function () {
    var __meta__ = {
        id: 'userevents',
        name: 'User Events',
        category: 'framework',
        depends: ['core'],
        hidden: true
    };
    (function ($, undefined) {
        var quilt = window.quilt, support = quilt.support, Class = quilt.Class, Observable = quilt.Observable, now = $.now, extend = $.extend, OS = support.mobileOS, invalidZeroEvents = OS && OS.android, DEFAULT_MIN_HOLD = 800, CLICK_DELAY = 300, DEFAULT_THRESHOLD = support.browser.msie ? 5 : 0, PRESS = 'press', HOLD = 'hold', SELECT = 'select', START = 'start', MOVE = 'move', END = 'end', CANCEL = 'cancel', TAP = 'tap', DOUBLETAP = 'doubleTap', RELEASE = 'release', GESTURESTART = 'gesturestart', GESTURECHANGE = 'gesturechange', GESTUREEND = 'gestureend', GESTURETAP = 'gesturetap';
        var THRESHOLD = {
            'api': 0,
            'touch': 0,
            'mouse': 9,
            'pointer': 9
        };
        var ENABLE_GLOBAL_SURFACE = !support.touch || support.mouseAndTouchPresent;
        function touchDelta(touch1, touch2) {
            var x1 = touch1.x.location, y1 = touch1.y.location, x2 = touch2.x.location, y2 = touch2.y.location, dx = x1 - x2, dy = y1 - y2;
            return {
                center: {
                    x: (x1 + x2) / 2,
                    y: (y1 + y2) / 2
                },
                distance: Math.sqrt(dx * dx + dy * dy)
            };
        }
        function getTouches(e) {
            var touches = [], originalEvent = e.originalEvent, currentTarget = e.currentTarget, idx = 0, length, changedTouches, touch;
            if (e.api) {
                touches.push({
                    id: 2,
                    event: e,
                    target: e.target,
                    currentTarget: e.target,
                    location: e,
                    type: 'api'
                });
            } else if (e.type.match(/touch/)) {
                changedTouches = originalEvent ? originalEvent.changedTouches : [];
                for (length = changedTouches.length; idx < length; idx++) {
                    touch = changedTouches[idx];
                    touches.push({
                        location: touch,
                        event: e,
                        target: touch.target,
                        currentTarget: currentTarget,
                        id: touch.identifier,
                        type: 'touch'
                    });
                }
            } else if (support.pointers || support.msPointers) {
                touches.push({
                    location: originalEvent,
                    event: e,
                    target: e.target,
                    currentTarget: currentTarget,
                    id: originalEvent.pointerId,
                    type: 'pointer'
                });
            } else {
                touches.push({
                    id: 1,
                    event: e,
                    target: e.target,
                    currentTarget: currentTarget,
                    location: e,
                    type: 'mouse'
                });
            }
            return touches;
        }
        var TouchAxis = Class.extend({
            init: function (axis, location) {
                var that = this;
                that.axis = axis;
                that._updateLocationData(location);
                that.startLocation = that.location;
                that.velocity = that.delta = 0;
                that.timeStamp = now();
            },
            move: function (location) {
                var that = this, offset = location['page' + that.axis], timeStamp = now(), timeDelta = timeStamp - that.timeStamp || 1;
                if (!offset && invalidZeroEvents) {
                    return;
                }
                that.delta = offset - that.location;
                that._updateLocationData(location);
                that.initialDelta = offset - that.startLocation;
                that.velocity = that.delta / timeDelta;
                that.timeStamp = timeStamp;
            },
            _updateLocationData: function (location) {
                var that = this, axis = that.axis;
                that.location = location['page' + axis];
                that.client = location['client' + axis];
                that.screen = location['screen' + axis];
            }
        });
        var Touch = Class.extend({
            init: function (userEvents, target, touchInfo) {
                extend(this, {
                    x: new TouchAxis('X', touchInfo.location),
                    y: new TouchAxis('Y', touchInfo.location),
                    type: touchInfo.type,
                    useClickAsTap: userEvents.useClickAsTap,
                    threshold: userEvents.threshold || THRESHOLD[touchInfo.type],
                    userEvents: userEvents,
                    target: target,
                    currentTarget: touchInfo.currentTarget,
                    initialTouch: touchInfo.target,
                    id: touchInfo.id,
                    pressEvent: touchInfo,
                    _clicks: userEvents._clicks,
                    supportDoubleTap: userEvents.supportDoubleTap,
                    _moved: false,
                    _finished: false
                });
            },
            press: function () {
                this._holdTimeout = setTimeout($.proxy(this, '_hold'), this.userEvents.minHold);
                this._trigger(PRESS, this.pressEvent);
            },
            _tap: function (touchInfo) {
                var that = this;
                that.userEvents._clicks++;
                if (that.userEvents._clicks == 1) {
                    that._clickTimeout = setTimeout(function () {
                        if (that.userEvents._clicks == 1) {
                            that._trigger(TAP, touchInfo);
                        } else {
                            that._trigger(DOUBLETAP, touchInfo);
                        }
                        that.userEvents._clicks = 0;
                    }, CLICK_DELAY);
                }
            },
            _hold: function () {
                this._trigger(HOLD, this.pressEvent);
            },
            move: function (touchInfo) {
                var that = this;
                var preventMove = touchInfo.type !== 'api' && that.userEvents._shouldNotMove;
                if (that._finished || preventMove) {
                    return;
                }
                that.x.move(touchInfo.location);
                that.y.move(touchInfo.location);
                if (!that._moved) {
                    if (that._withinIgnoreThreshold()) {
                        return;
                    }
                    if (!UserEvents.current || UserEvents.current === that.userEvents) {
                        that._start(touchInfo);
                    } else {
                        return that.dispose();
                    }
                }
                if (!that._finished) {
                    that._trigger(MOVE, touchInfo);
                }
            },
            end: function (touchInfo) {
                this.endTime = now();
                if (this._finished) {
                    return;
                }
                this._finished = true;
                this._trigger(RELEASE, touchInfo);
                if (this._moved) {
                    this._trigger(END, touchInfo);
                } else {
                    if (!this.useClickAsTap) {
                        if (this.supportDoubleTap) {
                            this._tap(touchInfo);
                        } else {
                            this._trigger(TAP, touchInfo);
                        }
                    }
                }
                clearTimeout(this._holdTimeout);
                this.dispose();
            },
            dispose: function () {
                var userEvents = this.userEvents, activeTouches = userEvents.touches;
                this._finished = true;
                this.pressEvent = null;
                clearTimeout(this._holdTimeout);
                activeTouches.splice($.inArray(this, activeTouches), 1);
            },
            skip: function () {
                this.dispose();
            },
            cancel: function () {
                this.dispose();
            },
            isMoved: function () {
                return this._moved;
            },
            _start: function (touchInfo) {
                clearTimeout(this._holdTimeout);
                this.startTime = now();
                this._moved = true;
                this._trigger(START, touchInfo);
            },
            _trigger: function (name, touchInfo) {
                var that = this, jQueryEvent = touchInfo.event, data = {
                        touch: that,
                        x: that.x,
                        y: that.y,
                        target: that.target,
                        event: jQueryEvent
                    };
                if (that.userEvents.notify(name, data)) {
                    jQueryEvent.preventDefault();
                }
            },
            _withinIgnoreThreshold: function () {
                var xDelta = this.x.initialDelta, yDelta = this.y.initialDelta;
                return Math.sqrt(xDelta * xDelta + yDelta * yDelta) <= this.threshold;
            }
        });
        function withEachUpEvent(callback) {
            var downEvents = quilt.eventMap.up.split(' '), idx = 0, length = downEvents.length;
            for (; idx < length; idx++) {
                callback(downEvents[idx]);
            }
        }
        var UserEvents = Observable.extend({
            init: function (element, options) {
                var that = this, filter, ns = quilt.guid();
                options = options || {};
                filter = that.filter = options.filter;
                that.threshold = options.threshold || DEFAULT_THRESHOLD;
                that.minHold = options.minHold || DEFAULT_MIN_HOLD;
                that.touches = [];
                that._maxTouches = options.multiTouch ? 2 : 1;
                that.allowSelection = options.allowSelection;
                that.captureUpIfMoved = options.captureUpIfMoved;
                that.useClickAsTap = !options.fastTap && !support.delayedClick();
                that.eventNS = ns;
                that._clicks = 0;
                that.supportDoubleTap = options.supportDoubleTap;
                element = $(element).handler(that);
                Observable.fn.init.call(that);
                extend(that, {
                    element: element,
                    surface: options.global && ENABLE_GLOBAL_SURFACE ? $(element[0].ownerDocument.documentElement) : $(options.surface || element),
                    stopPropagation: options.stopPropagation,
                    pressed: false
                });
                that.surface.handler(that).on(quilt.applyEventMap('move', ns), '_move').on(quilt.applyEventMap('up cancel', ns), '_end');
                element.on(quilt.applyEventMap('down', ns), filter, '_start');
                if (that.useClickAsTap) {
                    element.on(quilt.applyEventMap('click', ns), filter, '_click');
                }
                if (support.pointers || support.msPointers) {
                    if (support.browser.version < 11) {
                        var defaultAction = 'pinch-zoom double-tap-zoom';
                        element.css('-ms-touch-action', options.touchAction && options.touchAction != 'none' ? defaultAction + ' ' + options.touchAction : defaultAction);
                    } else {
                        element.css('touch-action', options.touchAction || 'none');
                    }
                }
                if (options.preventDragEvent) {
                    element.on(quilt.applyEventMap('dragstart', ns), quilt.preventDefault);
                }
                element.on(quilt.applyEventMap('mousedown', ns), filter, { root: element }, '_select');
                if (that.captureUpIfMoved && support.eventCapture) {
                    var surfaceElement = that.surface[0], preventIfMovingProxy = $.proxy(that.preventIfMoving, that);
                    withEachUpEvent(function (eventName) {
                        surfaceElement.addEventListener(eventName, preventIfMovingProxy, true);
                    });
                }
                that.bind([
                    PRESS,
                    HOLD,
                    TAP,
                    DOUBLETAP,
                    START,
                    MOVE,
                    END,
                    RELEASE,
                    CANCEL,
                    GESTURESTART,
                    GESTURECHANGE,
                    GESTUREEND,
                    GESTURETAP,
                    SELECT
                ], options);
            },
            preventIfMoving: function (e) {
                if (this._isMoved()) {
                    e.preventDefault();
                }
            },
            destroy: function () {
                var that = this;
                if (that._destroyed) {
                    return;
                }
                that._destroyed = true;
                if (that.captureUpIfMoved && support.eventCapture) {
                    var surfaceElement = that.surface[0];
                    withEachUpEvent(function (eventName) {
                        surfaceElement.removeEventListener(eventName, that.preventIfMoving);
                    });
                }
                that.element.quiltDestroy(that.eventNS);
                that.surface.quiltDestroy(that.eventNS);
                that.element.removeData('handler');
                that.surface.removeData('handler');
                that._disposeAll();
                that.unbind();
                delete that.surface;
                delete that.element;
                delete that.currentTarget;
            },
            capture: function () {
                UserEvents.current = this;
            },
            cancel: function () {
                this._disposeAll();
                this.trigger(CANCEL);
            },
            notify: function (eventName, data) {
                var that = this, touches = that.touches;
                if (this._isMultiTouch()) {
                    switch (eventName) {
                    case MOVE:
                        eventName = GESTURECHANGE;
                        break;
                    case END:
                        eventName = GESTUREEND;
                        break;
                    case TAP:
                        eventName = GESTURETAP;
                        break;
                    }
                    extend(data, { touches: touches }, touchDelta(touches[0], touches[1]));
                }
                return this.trigger(eventName, extend(data, { type: eventName }));
            },
            press: function (x, y, target) {
                this._apiCall('_start', x, y, target);
            },
            move: function (x, y) {
                this._apiCall('_move', x, y);
            },
            end: function (x, y) {
                this._apiCall('_end', x, y);
            },
            _isMultiTouch: function () {
                return this.touches.length > 1;
            },
            _maxTouchesReached: function () {
                return this.touches.length >= this._maxTouches;
            },
            _disposeAll: function () {
                var touches = this.touches;
                while (touches.length > 0) {
                    touches.pop().dispose();
                }
            },
            _isMoved: function () {
                return $.grep(this.touches, function (touch) {
                    return touch.isMoved();
                }).length;
            },
            _select: function (e) {
                if (!this.allowSelection || this.trigger(SELECT, { event: e })) {
                    e.preventDefault();
                }
            },
            _start: function (e) {
                var that = this, idx = 0, filter = that.filter, target, touches = getTouches(e), length = touches.length, touch, which = e.which;
                if (which && which > 1 || that._maxTouchesReached()) {
                    return;
                }
                UserEvents.current = null;
                that.currentTarget = e.currentTarget;
                if (that.stopPropagation) {
                    e.stopPropagation();
                }
                for (; idx < length; idx++) {
                    if (that._maxTouchesReached()) {
                        break;
                    }
                    touch = touches[idx];
                    if (filter) {
                        target = $(touch.currentTarget);
                    } else {
                        target = that.element;
                    }
                    if (!target.length) {
                        continue;
                    }
                    touch = new Touch(that, target, touch);
                    that.touches.push(touch);
                    touch.press();
                    if (that._isMultiTouch()) {
                        that.notify('gesturestart', {});
                    }
                }
            },
            _move: function (e) {
                this._eachTouch('move', e);
            },
            _end: function (e) {
                this._eachTouch('end', e);
            },
            _click: function (e) {
                var data = {
                    touch: {
                        initialTouch: e.target,
                        target: $(e.currentTarget),
                        endTime: now(),
                        x: {
                            location: e.pageX,
                            client: e.clientX
                        },
                        y: {
                            location: e.pageY,
                            client: e.clientY
                        }
                    },
                    x: e.pageX,
                    y: e.pageY,
                    target: $(e.currentTarget),
                    event: e,
                    type: 'tap'
                };
                if (this.trigger('tap', data)) {
                    e.preventDefault();
                }
            },
            _eachTouch: function (methodName, e) {
                var that = this, dict = {}, touches = getTouches(e), activeTouches = that.touches, idx, touch, touchInfo, matchingTouch;
                for (idx = 0; idx < activeTouches.length; idx++) {
                    touch = activeTouches[idx];
                    dict[touch.id] = touch;
                }
                for (idx = 0; idx < touches.length; idx++) {
                    touchInfo = touches[idx];
                    matchingTouch = dict[touchInfo.id];
                    if (matchingTouch) {
                        matchingTouch[methodName](touchInfo);
                    }
                }
            },
            _apiCall: function (type, x, y, target) {
                this[type]({
                    api: true,
                    pageX: x,
                    pageY: y,
                    clientX: x,
                    clientY: y,
                    target: $(target || this.element)[0],
                    stopPropagation: $.noop,
                    preventDefault: $.noop
                });
            }
        });
        UserEvents.defaultThreshold = function (value) {
            DEFAULT_THRESHOLD = value;
        };
        UserEvents.minHold = function (value) {
            DEFAULT_MIN_HOLD = value;
        };
        quilt.getTouches = getTouches;
        quilt.touchDelta = touchDelta;
        quilt.UserEvents = UserEvents;
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.draganddrop', [
        'quilt.core',
        'quilt.userevents'
    ], f);
}(function () {
    var __meta__ = {
        id: 'draganddrop',
        name: 'Drag & drop',
        category: 'framework',
        description: 'Drag & drop functionality for any DOM element.',
        depends: [
            'core',
            'userevents'
        ]
    };
    (function ($, undefined) {
        var quilt = window.quilt, support = quilt.support, document = window.document, $window = $(window), Class = quilt.Class, Widget = quilt.ui.Widget, Observable = quilt.Observable, UserEvents = quilt.UserEvents, proxy = $.proxy, extend = $.extend, getOffset = quilt.getOffset, draggables = {}, dropTargets = {}, dropAreas = {}, lastDropTarget, elementUnderCursor = quilt.elementUnderCursor, KEYUP = 'keyup', CHANGE = 'change', DRAGSTART = 'dragstart', HOLD = 'hold', DRAG = 'drag', DRAGEND = 'dragend', DRAGCANCEL = 'dragcancel', HINTDESTROYED = 'hintDestroyed', DRAGENTER = 'dragenter', DRAGLEAVE = 'dragleave', DROP = 'drop';
        function contains(parent, child) {
            try {
                return $.contains(parent, child) || parent == child;
            } catch (e) {
                return false;
            }
        }
        function numericCssPropery(element, property) {
            return parseInt(element.css(property), 10) || 0;
        }
        function within(value, range) {
            return Math.min(Math.max(value, range.min), range.max);
        }
        function containerBoundaries(container, element) {
            var offset = getOffset(container), outerWidth = quilt._outerWidth, outerHeight = quilt._outerHeight, minX = offset.left + numericCssPropery(container, 'borderLeftWidth') + numericCssPropery(container, 'paddingLeft'), minY = offset.top + numericCssPropery(container, 'borderTopWidth') + numericCssPropery(container, 'paddingTop'), maxX = minX + container.width() - outerWidth(element, true), maxY = minY + container.height() - outerHeight(element, true);
            return {
                x: {
                    min: minX,
                    max: maxX
                },
                y: {
                    min: minY,
                    max: maxY
                }
            };
        }
        function checkTarget(target, targets, areas) {
            var theTarget, theFilter, i = 0, targetLen = targets && targets.length, areaLen = areas && areas.length;
            while (target && target.parentNode) {
                for (i = 0; i < targetLen; i++) {
                    theTarget = targets[i];
                    if (theTarget.element[0] === target) {
                        return {
                            target: theTarget,
                            targetElement: target
                        };
                    }
                }
                for (i = 0; i < areaLen; i++) {
                    theFilter = areas[i];
                    if ($.contains(theFilter.element[0], target) && support.matchesSelector.call(target, theFilter.options.filter)) {
                        return {
                            target: theFilter,
                            targetElement: target
                        };
                    }
                }
                target = target.parentNode;
            }
            return undefined;
        }
        var TapCapture = Observable.extend({
            init: function (element, options) {
                var that = this, domElement = element[0];
                that.capture = false;
                if (domElement.addEventListener) {
                    $.each(quilt.eventMap.down.split(' '), function () {
                        domElement.addEventListener(this, proxy(that._press, that), true);
                    });
                    $.each(quilt.eventMap.up.split(' '), function () {
                        domElement.addEventListener(this, proxy(that._release, that), true);
                    });
                } else {
                    $.each(quilt.eventMap.down.split(' '), function () {
                        domElement.attachEvent(this, proxy(that._press, that));
                    });
                    $.each(quilt.eventMap.up.split(' '), function () {
                        domElement.attachEvent(this, proxy(that._release, that));
                    });
                }
                Observable.fn.init.call(that);
                that.bind([
                    'press',
                    'release'
                ], options || {});
            },
            captureNext: function () {
                this.capture = true;
            },
            cancelCapture: function () {
                this.capture = false;
            },
            _press: function (e) {
                var that = this;
                that.trigger('press');
                if (that.capture) {
                    e.preventDefault();
                }
            },
            _release: function (e) {
                var that = this;
                that.trigger('release');
                if (that.capture) {
                    e.preventDefault();
                    that.cancelCapture();
                }
            }
        });
        var PaneDimension = Observable.extend({
            init: function (options) {
                var that = this;
                Observable.fn.init.call(that);
                that.forcedEnabled = false;
                $.extend(that, options);
                that.scale = 1;
                if (that.horizontal) {
                    that.measure = 'offsetWidth';
                    that.scrollSize = 'scrollWidth';
                    that.axis = 'x';
                } else {
                    that.measure = 'offsetHeight';
                    that.scrollSize = 'scrollHeight';
                    that.axis = 'y';
                }
            },
            makeVirtual: function () {
                $.extend(this, {
                    virtual: true,
                    forcedEnabled: true,
                    _virtualMin: 0,
                    _virtualMax: 0
                });
            },
            virtualSize: function (min, max) {
                if (this._virtualMin !== min || this._virtualMax !== max) {
                    this._virtualMin = min;
                    this._virtualMax = max;
                    this.update();
                }
            },
            outOfBounds: function (offset) {
                return offset > this.max || offset < this.min;
            },
            forceEnabled: function () {
                this.forcedEnabled = true;
            },
            getSize: function () {
                return this.container[0][this.measure];
            },
            getTotal: function () {
                return this.element[0][this.scrollSize];
            },
            rescale: function (scale) {
                this.scale = scale;
            },
            update: function (silent) {
                var that = this, total = that.virtual ? that._virtualMax : that.getTotal(), scaledTotal = total * that.scale, size = that.getSize();
                if (total === 0 && !that.forcedEnabled) {
                    return;
                }
                that.max = that.virtual ? -that._virtualMin : 0;
                that.size = size;
                that.total = scaledTotal;
                that.min = Math.min(that.max, size - scaledTotal);
                that.minScale = size / total;
                that.centerOffset = (scaledTotal - size) / 2;
                that.enabled = that.forcedEnabled || scaledTotal > size;
                if (!silent) {
                    that.trigger(CHANGE, that);
                }
            }
        });
        var PaneDimensions = Observable.extend({
            init: function (options) {
                var that = this;
                Observable.fn.init.call(that);
                that.x = new PaneDimension(extend({ horizontal: true }, options));
                that.y = new PaneDimension(extend({ horizontal: false }, options));
                that.container = options.container;
                that.forcedMinScale = options.minScale;
                that.maxScale = options.maxScale || 100;
                that.bind(CHANGE, options);
            },
            rescale: function (newScale) {
                this.x.rescale(newScale);
                this.y.rescale(newScale);
                this.refresh();
            },
            centerCoordinates: function () {
                return {
                    x: Math.min(0, -this.x.centerOffset),
                    y: Math.min(0, -this.y.centerOffset)
                };
            },
            refresh: function () {
                var that = this;
                that.x.update();
                that.y.update();
                that.enabled = that.x.enabled || that.y.enabled;
                that.minScale = that.forcedMinScale || Math.min(that.x.minScale, that.y.minScale);
                that.fitScale = Math.max(that.x.minScale, that.y.minScale);
                that.trigger(CHANGE);
            }
        });
        var PaneAxis = Observable.extend({
            init: function (options) {
                var that = this;
                extend(that, options);
                Observable.fn.init.call(that);
            },
            outOfBounds: function () {
                return this.dimension.outOfBounds(this.movable[this.axis]);
            },
            dragMove: function (delta) {
                var that = this, dimension = that.dimension, axis = that.axis, movable = that.movable, position = movable[axis] + delta;
                if (!dimension.enabled) {
                    return;
                }
                if (position < dimension.min && delta < 0 || position > dimension.max && delta > 0) {
                    delta *= that.resistance;
                }
                movable.translateAxis(axis, delta);
                that.trigger(CHANGE, that);
            }
        });
        var Pane = Class.extend({
            init: function (options) {
                var that = this, x, y, resistance, movable;
                extend(that, { elastic: true }, options);
                resistance = that.elastic ? 0.5 : 0;
                movable = that.movable;
                that.x = x = new PaneAxis({
                    axis: 'x',
                    dimension: that.dimensions.x,
                    resistance: resistance,
                    movable: movable
                });
                that.y = y = new PaneAxis({
                    axis: 'y',
                    dimension: that.dimensions.y,
                    resistance: resistance,
                    movable: movable
                });
                that.userEvents.bind([
                    'press',
                    'move',
                    'end',
                    'gesturestart',
                    'gesturechange'
                ], {
                    gesturestart: function (e) {
                        that.gesture = e;
                        that.offset = that.dimensions.container.offset();
                    },
                    press: function (e) {
                        if ($(e.event.target).closest('a').is('[data-navigate-on-press=true]')) {
                            e.sender.cancel();
                        }
                    },
                    gesturechange: function (e) {
                        var previousGesture = that.gesture, previousCenter = previousGesture.center, center = e.center, scaleDelta = e.distance / previousGesture.distance, minScale = that.dimensions.minScale, maxScale = that.dimensions.maxScale, coordinates;
                        if (movable.scale <= minScale && scaleDelta < 1) {
                            scaleDelta += (1 - scaleDelta) * 0.8;
                        }
                        if (movable.scale * scaleDelta >= maxScale) {
                            scaleDelta = maxScale / movable.scale;
                        }
                        var offsetX = movable.x + that.offset.left, offsetY = movable.y + that.offset.top;
                        coordinates = {
                            x: (offsetX - previousCenter.x) * scaleDelta + center.x - offsetX,
                            y: (offsetY - previousCenter.y) * scaleDelta + center.y - offsetY
                        };
                        movable.scaleWith(scaleDelta);
                        x.dragMove(coordinates.x);
                        y.dragMove(coordinates.y);
                        that.dimensions.rescale(movable.scale);
                        that.gesture = e;
                        e.preventDefault();
                    },
                    move: function (e) {
                        if (e.event.target.tagName.match(/textarea|input/i)) {
                            return;
                        }
                        if (x.dimension.enabled || y.dimension.enabled) {
                            x.dragMove(e.x.delta);
                            y.dragMove(e.y.delta);
                            e.preventDefault();
                        } else {
                            e.touch.skip();
                        }
                    },
                    end: function (e) {
                        e.preventDefault();
                    }
                });
            }
        });
        var TRANSFORM_STYLE = support.transitions.prefix + 'Transform', translate;
        if (support.hasHW3D) {
            translate = function (x, y, scale) {
                return 'translate3d(' + x + 'px,' + y + 'px,0) scale(' + scale + ')';
            };
        } else {
            translate = function (x, y, scale) {
                return 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
            };
        }
        var Movable = Observable.extend({
            init: function (element) {
                var that = this;
                Observable.fn.init.call(that);
                that.element = $(element);
                that.element[0].style.webkitTransformOrigin = 'left top';
                that.x = 0;
                that.y = 0;
                that.scale = 1;
                that._saveCoordinates(translate(that.x, that.y, that.scale));
            },
            translateAxis: function (axis, by) {
                this[axis] += by;
                this.refresh();
            },
            scaleTo: function (scale) {
                this.scale = scale;
                this.refresh();
            },
            scaleWith: function (scaleDelta) {
                this.scale *= scaleDelta;
                this.refresh();
            },
            translate: function (coordinates) {
                this.x += coordinates.x;
                this.y += coordinates.y;
                this.refresh();
            },
            moveAxis: function (axis, value) {
                this[axis] = value;
                this.refresh();
            },
            moveTo: function (coordinates) {
                extend(this, coordinates);
                this.refresh();
            },
            refresh: function () {
                var that = this, x = that.x, y = that.y, newCoordinates;
                if (that.round) {
                    x = Math.round(x);
                    y = Math.round(y);
                }
                newCoordinates = translate(x, y, that.scale);
                if (newCoordinates != that.coordinates) {
                    if (quilt.support.browser.msie && quilt.support.browser.version < 10) {
                        that.element[0].style.position = 'absolute';
                        that.element[0].style.left = that.x + 'px';
                        that.element[0].style.top = that.y + 'px';
                    } else {
                        that.element[0].style[TRANSFORM_STYLE] = newCoordinates;
                    }
                    that._saveCoordinates(newCoordinates);
                    that.trigger(CHANGE);
                }
            },
            _saveCoordinates: function (coordinates) {
                this.coordinates = coordinates;
            }
        });
        function destroyDroppable(collection, widget) {
            var groupName = widget.options.group, droppables = collection[groupName], i;
            Widget.fn.destroy.call(widget);
            if (droppables.length > 1) {
                for (i = 0; i < droppables.length; i++) {
                    if (droppables[i] == widget) {
                        droppables.splice(i, 1);
                        break;
                    }
                }
            } else {
                droppables.length = 0;
                delete collection[groupName];
            }
        }
        var DropTarget = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                var group = that.options.group;
                if (!(group in dropTargets)) {
                    dropTargets[group] = [that];
                } else {
                    dropTargets[group].push(that);
                }
            },
            events: [
                DRAGENTER,
                DRAGLEAVE,
                DROP
            ],
            options: {
                name: 'DropTarget',
                group: 'default'
            },
            destroy: function () {
                destroyDroppable(dropTargets, this);
            },
            _trigger: function (eventName, e) {
                var that = this, draggable = draggables[that.options.group];
                if (draggable) {
                    return that.trigger(eventName, extend({}, e.event, {
                        draggable: draggable,
                        dropTarget: e.dropTarget
                    }));
                }
            },
            _over: function (e) {
                this._trigger(DRAGENTER, e);
            },
            _out: function (e) {
                this._trigger(DRAGLEAVE, e);
            },
            _drop: function (e) {
                var that = this, draggable = draggables[that.options.group];
                if (draggable) {
                    draggable.dropped = !that._trigger(DROP, e);
                }
            }
        });
        DropTarget.destroyGroup = function (groupName) {
            var group = dropTargets[groupName] || dropAreas[groupName], i;
            if (group) {
                for (i = 0; i < group.length; i++) {
                    Widget.fn.destroy.call(group[i]);
                }
                group.length = 0;
                delete dropTargets[groupName];
                delete dropAreas[groupName];
            }
        };
        DropTarget._cache = dropTargets;
        var DropTargetArea = DropTarget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                var group = that.options.group;
                if (!(group in dropAreas)) {
                    dropAreas[group] = [that];
                } else {
                    dropAreas[group].push(that);
                }
            },
            destroy: function () {
                destroyDroppable(dropAreas, this);
            },
            options: {
                name: 'DropTargetArea',
                group: 'default',
                filter: null
            }
        });
        var Draggable = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                that._activated = false;
                that.userEvents = new UserEvents(that.element, {
                    global: true,
                    allowSelection: true,
                    filter: that.options.filter,
                    threshold: that.options.distance,
                    start: proxy(that._start, that),
                    hold: proxy(that._hold, that),
                    move: proxy(that._drag, that),
                    end: proxy(that._end, that),
                    cancel: proxy(that._cancel, that),
                    select: proxy(that._select, that)
                });
                if (quilt.support.touch) {
                    that.element.find(that.options.filter).css('touch-action', 'none');
                }
                that._afterEndHandler = proxy(that._afterEnd, that);
                that._captureEscape = proxy(that._captureEscape, that);
            },
            events: [
                HOLD,
                DRAGSTART,
                DRAG,
                DRAGEND,
                DRAGCANCEL,
                HINTDESTROYED
            ],
            options: {
                name: 'Draggable',
                distance: quilt.support.touch ? 0 : 5,
                group: 'default',
                cursorOffset: null,
                axis: null,
                container: null,
                filter: null,
                ignore: null,
                holdToDrag: false,
                autoScroll: false,
                dropped: false
            },
            cancelHold: function () {
                this._activated = false;
            },
            _captureEscape: function (e) {
                var that = this;
                if (e.keyCode === quilt.keys.ESC) {
                    that._trigger(DRAGCANCEL, { event: e });
                    that.userEvents.cancel();
                }
            },
            _updateHint: function (e) {
                var that = this, coordinates, options = that.options, boundaries = that.boundaries, axis = options.axis, cursorOffset = that.options.cursorOffset;
                if (cursorOffset) {
                    coordinates = {
                        left: e.x.location + cursorOffset.left,
                        top: e.y.location + cursorOffset.top
                    };
                } else {
                    that.hintOffset.left += e.x.delta;
                    that.hintOffset.top += e.y.delta;
                    coordinates = $.extend({}, that.hintOffset);
                }
                if (boundaries) {
                    coordinates.top = within(coordinates.top, boundaries.y);
                    coordinates.left = within(coordinates.left, boundaries.x);
                }
                if (axis === 'x') {
                    delete coordinates.top;
                } else if (axis === 'y') {
                    delete coordinates.left;
                }
                that.hint.css(coordinates);
            },
            _shouldIgnoreTarget: function (target) {
                var ignoreSelector = this.options.ignore;
                return ignoreSelector && $(target).is(ignoreSelector);
            },
            _select: function (e) {
                if (!this._shouldIgnoreTarget(e.event.target)) {
                    e.preventDefault();
                }
            },
            _start: function (e) {
                var that = this, options = that.options, container = options.container ? $(options.container) : null, hint = options.hint;
                if (this._shouldIgnoreTarget(e.touch.initialTouch) || options.holdToDrag && !that._activated) {
                    that.userEvents.cancel();
                    return;
                }
                that.currentTarget = e.target;
                that.currentTargetOffset = getOffset(that.currentTarget);
                if (hint) {
                    if (that.hint) {
                        that.hint.stop(true, true).remove();
                    }
                    that.hint = quilt.isFunction(hint) ? $(hint.call(that, that.currentTarget)) : hint;
                    var offset = getOffset(that.currentTarget);
                    that.hintOffset = offset;
                    that.hint.css({
                        position: 'absolute',
                        zIndex: 20000,
                        left: offset.left,
                        top: offset.top
                    }).appendTo(document.body);
                    that.angular('compile', function () {
                        that.hint.removeAttr('ng-repeat');
                        var scopeTarget = $(e.target);
                        while (!scopeTarget.data('$$quiltScope') && scopeTarget.length) {
                            scopeTarget = scopeTarget.parent();
                        }
                        return {
                            elements: that.hint.get(),
                            scopeFrom: scopeTarget.data('$$quiltScope')
                        };
                    });
                }
                draggables[options.group] = that;
                that.dropped = false;
                if (container) {
                    that.boundaries = containerBoundaries(container, that.hint);
                }
                $(document).on(KEYUP, that._captureEscape);
                if (that._trigger(DRAGSTART, e)) {
                    that.userEvents.cancel();
                    that._afterEnd();
                }
                that.userEvents.capture();
            },
            _hold: function (e) {
                this.currentTarget = e.target;
                if (this._trigger(HOLD, e)) {
                    this.userEvents.cancel();
                } else {
                    this._activated = true;
                }
            },
            _drag: function (e) {
                e.preventDefault();
                var cursorElement = this._elementUnderCursor(e);
                if (this.options.autoScroll && this._cursorElement !== cursorElement) {
                    this._scrollableParent = findScrollableParent(cursorElement);
                    this._cursorElement = cursorElement;
                }
                this._lastEvent = e;
                this._processMovement(e, cursorElement);
                if (this.options.autoScroll) {
                    if (this._scrollableParent[0]) {
                        var velocity = autoScrollVelocity(e.x.location, e.y.location, scrollableViewPort(this._scrollableParent));
                        this._scrollCompenstation = $.extend({}, this.hintOffset);
                        this._scrollVelocity = velocity;
                        if (velocity.y === 0 && velocity.x === 0) {
                            clearInterval(this._scrollInterval);
                            this._scrollInterval = null;
                        } else if (!this._scrollInterval) {
                            this._scrollInterval = setInterval($.proxy(this, '_autoScroll'), 50);
                        }
                    }
                }
                if (this.hint) {
                    this._updateHint(e);
                }
            },
            _processMovement: function (e, cursorElement) {
                this._withDropTarget(cursorElement, function (target, targetElement) {
                    if (!target) {
                        if (lastDropTarget) {
                            lastDropTarget._trigger(DRAGLEAVE, extend(e, { dropTarget: $(lastDropTarget.targetElement) }));
                            lastDropTarget = null;
                        }
                        return;
                    }
                    if (lastDropTarget) {
                        if (targetElement === lastDropTarget.targetElement) {
                            return;
                        }
                        lastDropTarget._trigger(DRAGLEAVE, extend(e, { dropTarget: $(lastDropTarget.targetElement) }));
                    }
                    target._trigger(DRAGENTER, extend(e, { dropTarget: $(targetElement) }));
                    lastDropTarget = extend(target, { targetElement: targetElement });
                });
                this._trigger(DRAG, extend(e, {
                    dropTarget: lastDropTarget,
                    elementUnderCursor: cursorElement
                }));
            },
            _autoScroll: function () {
                var parent = this._scrollableParent[0], velocity = this._scrollVelocity, compensation = this._scrollCompenstation;
                if (!parent) {
                    return;
                }
                var cursorElement = this._elementUnderCursor(this._lastEvent);
                this._processMovement(this._lastEvent, cursorElement);
                var yIsScrollable, xIsScrollable;
                var isRootNode = parent === scrollableRoot()[0];
                if (isRootNode) {
                    yIsScrollable = document.body.scrollHeight > $window.height();
                    xIsScrollable = document.body.scrollWidth > $window.width();
                } else {
                    yIsScrollable = parent.offsetHeight <= parent.scrollHeight;
                    xIsScrollable = parent.offsetWidth <= parent.scrollWidth;
                }
                var yDelta = parent.scrollTop + velocity.y;
                var yInBounds = yIsScrollable && yDelta > 0 && yDelta < parent.scrollHeight;
                var xDelta = parent.scrollLeft + velocity.x;
                var xInBounds = xIsScrollable && xDelta > 0 && xDelta < parent.scrollWidth;
                if (yInBounds) {
                    parent.scrollTop += velocity.y;
                } else if (yIsScrollable && yDelta < 0) {
                    parent.scrollTop = 0;
                }
                if (xInBounds) {
                    parent.scrollLeft += velocity.x;
                } else if (xIsScrollable && xDelta < 0) {
                    parent.scrollLeft = 0;
                }
                if (this.hint && isRootNode && (xInBounds || yInBounds)) {
                    if (yInBounds) {
                        compensation.top += velocity.y;
                    }
                    if (xInBounds) {
                        compensation.left += velocity.x;
                    }
                    this.hint.css(compensation);
                }
            },
            _end: function (e) {
                this._withDropTarget(this._elementUnderCursor(e), function (target, targetElement) {
                    if (target) {
                        target._drop(extend({}, e, { dropTarget: $(targetElement) }));
                        lastDropTarget = null;
                    }
                });
                clearInterval(this._scrollInterval);
                this._scrollInterval = null;
                this._cancel(this._trigger(DRAGEND, e));
            },
            _cancel: function (isDefaultPrevented) {
                var that = this;
                that._scrollableParent = null;
                this._cursorElement = null;
                clearInterval(this._scrollInterval);
                that._activated = false;
                if (that.hint && !that.dropped) {
                    setTimeout(function () {
                        that.hint.stop(true, true);
                        if (isDefaultPrevented) {
                            that._afterEndHandler();
                        } else {
                            that.hint.animate(that.currentTargetOffset, 'fast', that._afterEndHandler);
                        }
                    }, 0);
                } else {
                    that._afterEnd();
                }
            },
            _trigger: function (eventName, e) {
                var that = this;
                return that.trigger(eventName, extend({}, e.event, {
                    x: e.x,
                    y: e.y,
                    currentTarget: that.currentTarget,
                    initialTarget: e.touch ? e.touch.initialTouch : null,
                    dropTarget: e.dropTarget,
                    elementUnderCursor: e.elementUnderCursor
                }));
            },
            _elementUnderCursor: function (e) {
                var target = elementUnderCursor(e), hint = this.hint;
                if (hint && contains(hint[0], target)) {
                    hint.hide();
                    target = elementUnderCursor(e);
                    if (!target) {
                        target = elementUnderCursor(e);
                    }
                    hint.show();
                }
                return target;
            },
            _withDropTarget: function (element, callback) {
                var result, group = this.options.group, targets = dropTargets[group], areas = dropAreas[group];
                if (targets && targets.length || areas && areas.length) {
                    result = checkTarget(element, targets, areas);
                    if (result) {
                        callback(result.target, result.targetElement);
                    } else {
                        callback();
                    }
                }
            },
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that._afterEnd();
                that.userEvents.destroy();
                this._scrollableParent = null;
                this._cursorElement = null;
                clearInterval(this._scrollInterval);
                that.currentTarget = null;
            },
            _afterEnd: function () {
                var that = this;
                if (that.hint) {
                    that.hint.remove();
                }
                delete draggables[that.options.group];
                that.trigger('destroy');
                that.trigger(HINTDESTROYED);
                $(document).off(KEYUP, that._captureEscape);
            }
        });
        quilt.ui.plugin(DropTarget);
        quilt.ui.plugin(DropTargetArea);
        quilt.ui.plugin(Draggable);
        quilt.TapCapture = TapCapture;
        quilt.containerBoundaries = containerBoundaries;
        extend(quilt.ui, {
            Pane: Pane,
            PaneDimensions: PaneDimensions,
            Movable: Movable
        });
        function scrollableViewPort(element) {
            var root = scrollableRoot()[0], offset, top, left;
            if (element[0] === root) {
                top = root.scrollTop;
                left = root.scrollLeft;
                return {
                    top: top,
                    left: left,
                    bottom: top + $window.height(),
                    right: left + $window.width()
                };
            } else {
                offset = element.offset();
                offset.bottom = offset.top + element.height();
                offset.right = offset.left + element.width();
                return offset;
            }
        }
        function scrollableRoot() {
            return $(quilt.support.browser.edge || quilt.support.browser.safari ? document.body : document.documentElement);
        }
        function findScrollableParent(element) {
            var root = scrollableRoot();
            if (!element || element === document.body || element === document.documentElement) {
                return root;
            }
            var parent = $(element)[0];
            while (parent && !quilt.isScrollable(parent) && parent !== document.body) {
                parent = parent.parentNode;
            }
            if (parent === document.body) {
                return root;
            }
            return $(parent);
        }
        function autoScrollVelocity(mouseX, mouseY, rect) {
            var velocity = {
                x: 0,
                y: 0
            };
            var AUTO_SCROLL_AREA = 50;
            if (mouseX - rect.left < AUTO_SCROLL_AREA) {
                velocity.x = -(AUTO_SCROLL_AREA - (mouseX - rect.left));
            } else if (rect.right - mouseX < AUTO_SCROLL_AREA) {
                velocity.x = AUTO_SCROLL_AREA - (rect.right - mouseX);
            }
            if (mouseY - rect.top < AUTO_SCROLL_AREA) {
                velocity.y = -(AUTO_SCROLL_AREA - (mouseY - rect.top));
            } else if (rect.bottom - mouseY < AUTO_SCROLL_AREA) {
                velocity.y = AUTO_SCROLL_AREA - (rect.bottom - mouseY);
            }
            return velocity;
        }
        quilt.ui.Draggable.utils = {
            autoScrollVelocity: autoScrollVelocity,
            scrollableViewPort: scrollableViewPort,
            findScrollableParent: findScrollableParent
        };
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.mobile.scroller', [
        'quilt.fx',
        'quilt.draganddrop'
    ], f);
}(function () {
    var __meta__ = {
        id: 'mobile.scroller',
        name: 'Scroller',
        category: 'mobile',
        description: 'The Quilt Mobile Scroller widget enables touch friendly kinetic scrolling for the contents of a given DOM element.',
        depends: [
            'fx',
            'draganddrop'
        ]
    };
    (function ($, undefined) {
        var quilt = window.quilt, mobile = quilt.mobile, fx = quilt.effects, ui = mobile.ui, proxy = $.proxy, extend = $.extend, Widget = ui.Widget, Class = quilt.Class, Movable = quilt.ui.Movable, Pane = quilt.ui.Pane, PaneDimensions = quilt.ui.PaneDimensions, Transition = fx.Transition, Animation = fx.Animation, abs = Math.abs, SNAPBACK_DURATION = 500, SCROLLBAR_OPACITY = 0.7, FRICTION = 0.96, VELOCITY_MULTIPLIER = 10, MAX_VELOCITY = 55, OUT_OF_BOUNDS_FRICTION = 0.5, ANIMATED_SCROLLER_PRECISION = 5, RELEASECLASS = 'km-scroller-release', REFRESHCLASS = 'km-scroller-refresh', PULL = 'pull', CHANGE = 'change', RESIZE = 'resize', SCROLL = 'scroll', MOUSE_WHEEL_ID = 2;
        var ZoomSnapBack = Animation.extend({
            init: function (options) {
                var that = this;
                Animation.fn.init.call(that);
                extend(that, options);
                that.userEvents.bind('gestureend', proxy(that.start, that));
                that.tapCapture.bind('press', proxy(that.cancel, that));
            },
            enabled: function () {
                return this.movable.scale < this.dimensions.minScale;
            },
            done: function () {
                return this.dimensions.minScale - this.movable.scale < 0.01;
            },
            tick: function () {
                var movable = this.movable;
                movable.scaleWith(1.1);
                this.dimensions.rescale(movable.scale);
            },
            onEnd: function () {
                var movable = this.movable;
                movable.scaleTo(this.dimensions.minScale);
                this.dimensions.rescale(movable.scale);
            }
        });
        var DragInertia = Animation.extend({
            init: function (options) {
                var that = this;
                Animation.fn.init.call(that);
                extend(that, options, {
                    transition: new Transition({
                        axis: options.axis,
                        movable: options.movable,
                        onEnd: function () {
                            that._end();
                        }
                    })
                });
                that.tapCapture.bind('press', function () {
                    that.cancel();
                });
                that.userEvents.bind('end', proxy(that.start, that));
                that.userEvents.bind('gestureend', proxy(that.start, that));
                that.userEvents.bind('tap', proxy(that.onEnd, that));
            },
            onCancel: function () {
                this.transition.cancel();
            },
            freeze: function (location) {
                var that = this;
                that.cancel();
                that._moveTo(location);
            },
            onEnd: function () {
                var that = this;
                if (that.paneAxis.outOfBounds()) {
                    that._snapBack();
                } else {
                    that._end();
                }
            },
            done: function () {
                return abs(this.velocity) < 1;
            },
            start: function (e) {
                var that = this, velocity;
                if (!that.dimension.enabled) {
                    return;
                }
                if (that.paneAxis.outOfBounds()) {
                    if (that.transition._started) {
                        that.transition.cancel();
                        that.velocity = Math.min(e.touch[that.axis].velocity * that.velocityMultiplier, MAX_VELOCITY);
                        Animation.fn.start.call(that);
                    } else {
                        that._snapBack();
                    }
                } else {
                    velocity = e.touch.id === MOUSE_WHEEL_ID ? 0 : e.touch[that.axis].velocity;
                    that.velocity = Math.max(Math.min(velocity * that.velocityMultiplier, MAX_VELOCITY), -MAX_VELOCITY);
                    that.tapCapture.captureNext();
                    Animation.fn.start.call(that);
                }
            },
            tick: function () {
                var that = this, dimension = that.dimension, friction = that.paneAxis.outOfBounds() ? OUT_OF_BOUNDS_FRICTION : that.friction, delta = that.velocity *= friction, location = that.movable[that.axis] + delta;
                if (!that.elastic && dimension.outOfBounds(location)) {
                    location = Math.max(Math.min(location, dimension.max), dimension.min);
                    that.velocity = 0;
                }
                that.movable.moveAxis(that.axis, location);
            },
            _end: function () {
                this.tapCapture.cancelCapture();
                this.end();
            },
            _snapBack: function () {
                var that = this, dimension = that.dimension, snapBack = that.movable[that.axis] > dimension.max ? dimension.max : dimension.min;
                that._moveTo(snapBack);
            },
            _moveTo: function (location) {
                this.transition.moveTo({
                    location: location,
                    duration: SNAPBACK_DURATION,
                    ease: Transition.easeOutExpo
                });
            }
        });
        var AnimatedScroller = Animation.extend({
            init: function (options) {
                var that = this;
                quilt.effects.Animation.fn.init.call(this);
                extend(that, options, {
                    origin: {},
                    destination: {},
                    offset: {}
                });
            },
            tick: function () {
                this._updateCoordinates();
                this.moveTo(this.origin);
            },
            done: function () {
                return abs(this.offset.y) < ANIMATED_SCROLLER_PRECISION && abs(this.offset.x) < ANIMATED_SCROLLER_PRECISION;
            },
            onEnd: function () {
                this.moveTo(this.destination);
                if (this.callback) {
                    this.callback.call();
                }
            },
            setCoordinates: function (from, to) {
                this.offset = {};
                this.origin = from;
                this.destination = to;
            },
            setCallback: function (callback) {
                if (callback && quilt.isFunction(callback)) {
                    this.callback = callback;
                } else {
                    callback = undefined;
                }
            },
            _updateCoordinates: function () {
                this.offset = {
                    x: (this.destination.x - this.origin.x) / 4,
                    y: (this.destination.y - this.origin.y) / 4
                };
                this.origin = {
                    y: this.origin.y + this.offset.y,
                    x: this.origin.x + this.offset.x
                };
            }
        });
        var ScrollBar = Class.extend({
            init: function (options) {
                var that = this, horizontal = options.axis === 'x', element = $('<div class="km-touch-scrollbar km-' + (horizontal ? 'horizontal' : 'vertical') + '-scrollbar" />');
                extend(that, options, {
                    element: element,
                    elementSize: 0,
                    movable: new Movable(element),
                    scrollMovable: options.movable,
                    alwaysVisible: options.alwaysVisible,
                    size: horizontal ? 'width' : 'height'
                });
                that.scrollMovable.bind(CHANGE, proxy(that.refresh, that));
                that.container.append(element);
                if (options.alwaysVisible) {
                    that.show();
                }
            },
            refresh: function () {
                var that = this, axis = that.axis, dimension = that.dimension, paneSize = dimension.size, scrollMovable = that.scrollMovable, sizeRatio = paneSize / dimension.total, position = Math.round(-scrollMovable[axis] * sizeRatio), size = Math.round(paneSize * sizeRatio);
                if (sizeRatio >= 1) {
                    this.element.css('display', 'none');
                } else {
                    this.element.css('display', '');
                }
                if (position + size > paneSize) {
                    size = paneSize - position;
                } else if (position < 0) {
                    size += position;
                    position = 0;
                }
                if (that.elementSize != size) {
                    that.element.css(that.size, size + 'px');
                    that.elementSize = size;
                }
                that.movable.moveAxis(axis, position);
            },
            show: function () {
                this.element.css({
                    opacity: SCROLLBAR_OPACITY,
                    visibility: 'visible'
                });
            },
            hide: function () {
                if (!this.alwaysVisible) {
                    this.element.css({ opacity: 0 });
                }
            }
        });
        var Scroller = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                element = that.element;
                that._native = that.options.useNative && quilt.support.hasNativeScrolling;
                if (that._native) {
                    element.addClass('km-native-scroller').prepend('<div class="km-scroll-header"/>');
                    extend(that, {
                        scrollElement: element,
                        fixedContainer: element.children().first()
                    });
                    return;
                }
                element.css('overflow', 'hidden').addClass('km-scroll-wrapper').wrapInner('<div class="km-scroll-container"/>').prepend('<div class="km-scroll-header"/>');
                var inner = element.children().eq(1), tapCapture = new quilt.TapCapture(element), movable = new Movable(inner), dimensions = new PaneDimensions({
                        element: inner,
                        container: element,
                        forcedEnabled: that.options.zoom
                    }), avoidScrolling = this.options.avoidScrolling, userEvents = new quilt.UserEvents(element, {
                        touchAction: 'pan-y',
                        fastTap: true,
                        allowSelection: true,
                        preventDragEvent: true,
                        captureUpIfMoved: true,
                        multiTouch: that.options.zoom,
                        supportDoubleTap: that.options.supportDoubleTap,
                        start: function (e) {
                            dimensions.refresh();
                            var velocityX = abs(e.x.velocity), velocityY = abs(e.y.velocity), horizontalSwipe = velocityX * 2 >= velocityY, originatedFromFixedContainer = $.contains(that.fixedContainer[0], e.event.target), verticalSwipe = velocityY * 2 >= velocityX;
                            if (!originatedFromFixedContainer && !avoidScrolling(e) && that.enabled && (dimensions.x.enabled && horizontalSwipe || dimensions.y.enabled && verticalSwipe)) {
                                userEvents.capture();
                            } else {
                                userEvents.cancel();
                            }
                        }
                    }), pane = new Pane({
                        movable: movable,
                        dimensions: dimensions,
                        userEvents: userEvents,
                        elastic: that.options.elastic
                    }), zoomSnapBack = new ZoomSnapBack({
                        movable: movable,
                        dimensions: dimensions,
                        userEvents: userEvents,
                        tapCapture: tapCapture
                    }), animatedScroller = new AnimatedScroller({
                        moveTo: function (coordinates) {
                            that.scrollTo(coordinates.x, coordinates.y);
                        }
                    });
                movable.bind(CHANGE, function () {
                    that.scrollTop = -movable.y;
                    that.scrollLeft = -movable.x;
                    that.trigger(SCROLL, {
                        scrollTop: that.scrollTop,
                        scrollLeft: that.scrollLeft
                    });
                });
                if (that.options.mousewheelScrolling) {
                    element.on('DOMMouseScroll mousewheel', proxy(this, '_wheelScroll'));
                }
                extend(that, {
                    movable: movable,
                    dimensions: dimensions,
                    zoomSnapBack: zoomSnapBack,
                    animatedScroller: animatedScroller,
                    userEvents: userEvents,
                    pane: pane,
                    tapCapture: tapCapture,
                    pulled: false,
                    enabled: true,
                    scrollElement: inner,
                    scrollTop: 0,
                    scrollLeft: 0,
                    fixedContainer: element.children().first()
                });
                that._initAxis('x');
                that._initAxis('y');
                that._wheelEnd = function () {
                    that._wheel = false;
                    that.userEvents.end(0, that._wheelY);
                };
                dimensions.refresh();
                if (that.options.pullToRefresh) {
                    that._initPullToRefresh();
                }
            },
            _wheelScroll: function (e) {
                if (e.ctrlKey) {
                    return;
                }
                if (!this._wheel) {
                    this._wheel = true;
                    this._wheelY = 0;
                    this.userEvents.press(0, this._wheelY);
                }
                clearTimeout(this._wheelTimeout);
                this._wheelTimeout = setTimeout(this._wheelEnd, 50);
                var delta = quilt.wheelDeltaY(e);
                if (delta) {
                    this._wheelY += delta;
                    this.userEvents.move(0, this._wheelY);
                }
                e.preventDefault();
            },
            makeVirtual: function () {
                this.dimensions.y.makeVirtual();
            },
            virtualSize: function (min, max) {
                this.dimensions.y.virtualSize(min, max);
            },
            height: function () {
                return this.dimensions.y.size;
            },
            scrollHeight: function () {
                return this.scrollElement[0].scrollHeight;
            },
            scrollWidth: function () {
                return this.scrollElement[0].scrollWidth;
            },
            options: {
                name: 'Scroller',
                zoom: false,
                pullOffset: 140,
                visibleScrollHints: false,
                elastic: true,
                useNative: false,
                mousewheelScrolling: true,
                avoidScrolling: function () {
                    return false;
                },
                pullToRefresh: false,
                messages: {
                    pullTemplate: 'Pull to refresh',
                    releaseTemplate: 'Release to refresh',
                    refreshTemplate: 'Refreshing'
                }
            },
            events: [
                PULL,
                SCROLL,
                RESIZE
            ],
            _resize: function () {
                if (!this._native) {
                    this.contentResized();
                }
            },
            setOptions: function (options) {
                var that = this;
                Widget.fn.setOptions.call(that, options);
                if (options.pullToRefresh) {
                    that._initPullToRefresh();
                }
            },
            reset: function () {
                if (this._native) {
                    this.scrollElement.scrollTop(0);
                } else {
                    this.movable.moveTo({
                        x: 0,
                        y: 0
                    });
                    this._scale(1);
                }
            },
            contentResized: function () {
                this.dimensions.refresh();
                if (this.pane.x.outOfBounds()) {
                    this.movable.moveAxis('x', this.dimensions.x.min);
                }
                if (this.pane.y.outOfBounds()) {
                    this.movable.moveAxis('y', this.dimensions.y.min);
                }
            },
            zoomOut: function () {
                var dimensions = this.dimensions;
                dimensions.refresh();
                this._scale(dimensions.fitScale);
                this.movable.moveTo(dimensions.centerCoordinates());
            },
            enable: function () {
                this.enabled = true;
            },
            disable: function () {
                this.enabled = false;
            },
            scrollTo: function (x, y) {
                if (this._native) {
                    quilt.scrollLeft(this.scrollElement, abs(x));
                    this.scrollElement.scrollTop(abs(y));
                } else {
                    this.dimensions.refresh();
                    this.movable.moveTo({
                        x: x,
                        y: y
                    });
                }
            },
            animatedScrollTo: function (x, y, callback) {
                var from, to;
                if (this._native) {
                    this.scrollTo(x, y);
                } else {
                    from = {
                        x: this.movable.x,
                        y: this.movable.y
                    };
                    to = {
                        x: x,
                        y: y
                    };
                    this.animatedScroller.setCoordinates(from, to);
                    this.animatedScroller.setCallback(callback);
                    this.animatedScroller.start();
                }
            },
            pullHandled: function () {
                var that = this;
                that.refreshHint.removeClass(REFRESHCLASS);
                that.hintContainer.html(that.pullTemplate({}));
                that.yinertia.onEnd();
                that.xinertia.onEnd();
                that.userEvents.cancel();
            },
            destroy: function () {
                Widget.fn.destroy.call(this);
                if (this.userEvents) {
                    this.userEvents.destroy();
                }
            },
            _scale: function (scale) {
                this.dimensions.rescale(scale);
                this.movable.scaleTo(scale);
            },
            _initPullToRefresh: function () {
                var that = this;
                that.dimensions.y.forceEnabled();
                that.pullTemplate = quilt.template(that.options.messages.pullTemplate);
                that.releaseTemplate = quilt.template(that.options.messages.releaseTemplate);
                that.refreshTemplate = quilt.template(that.options.messages.refreshTemplate);
                that.scrollElement.prepend('<span class="km-scroller-pull"><span class="km-icon"></span><span class="km-loading-left"></span><span class="km-loading-right"></span><span class="km-template">' + that.pullTemplate({}) + '</span></span>');
                that.refreshHint = that.scrollElement.children().first();
                that.hintContainer = that.refreshHint.children('.km-template');
                that.pane.y.bind('change', proxy(that._paneChange, that));
                that.userEvents.bind('end', proxy(that._dragEnd, that));
            },
            _dragEnd: function () {
                var that = this;
                if (!that.pulled) {
                    return;
                }
                that.pulled = false;
                that.refreshHint.removeClass(RELEASECLASS).addClass(REFRESHCLASS);
                that.hintContainer.html(that.refreshTemplate({}));
                that.yinertia.freeze(that.options.pullOffset / 2);
                that.trigger('pull');
            },
            _paneChange: function () {
                var that = this;
                if (that.movable.y / OUT_OF_BOUNDS_FRICTION > that.options.pullOffset) {
                    if (!that.pulled) {
                        that.pulled = true;
                        that.refreshHint.removeClass(REFRESHCLASS).addClass(RELEASECLASS);
                        that.hintContainer.html(that.releaseTemplate({}));
                    }
                } else if (that.pulled) {
                    that.pulled = false;
                    that.refreshHint.removeClass(RELEASECLASS);
                    that.hintContainer.html(that.pullTemplate({}));
                }
            },
            _initAxis: function (axis) {
                var that = this, movable = that.movable, dimension = that.dimensions[axis], tapCapture = that.tapCapture, paneAxis = that.pane[axis], scrollBar = new ScrollBar({
                        axis: axis,
                        movable: movable,
                        dimension: dimension,
                        container: that.element,
                        alwaysVisible: that.options.visibleScrollHints
                    });
                dimension.bind(CHANGE, function () {
                    scrollBar.refresh();
                });
                paneAxis.bind(CHANGE, function () {
                    scrollBar.show();
                });
                that[axis + 'inertia'] = new DragInertia({
                    axis: axis,
                    paneAxis: paneAxis,
                    movable: movable,
                    tapCapture: tapCapture,
                    userEvents: that.userEvents,
                    dimension: dimension,
                    elastic: that.options.elastic,
                    friction: that.options.friction || FRICTION,
                    velocityMultiplier: that.options.velocityMultiplier || VELOCITY_MULTIPLIER,
                    end: function () {
                        scrollBar.hide();
                        that.trigger('scrollEnd', {
                            axis: axis,
                            scrollTop: that.scrollTop,
                            scrollLeft: that.scrollLeft
                        });
                    }
                });
            }
        });
        ui.plugin(Scroller);
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.groupable', [
        'quilt.core',
        'quilt.draganddrop'
    ], f);
}(function () {
    var __meta__ = {
        id: 'groupable',
        name: 'Groupable',
        category: 'framework',
        depends: [
            'core',
            'draganddrop'
        ],
        advanced: true
    };
    (function ($, undefined) {
        var quilt = window.quilt, Widget = quilt.ui.Widget, outerWidth = quilt._outerWidth, quiltAttr = quilt.attr, extend = $.extend, each = $.each, proxy = $.proxy, isRtl = false, DIR = 'dir', FIELD = 'field', TITLE = 'title', ASCENDING = 'asc', DESCENDING = 'desc', GROUP_SORT = 'group-sort', NS = '.quiltGroupable', CHANGE = 'change', indicatorTmpl = quilt.template('<div class="k-group-indicator" data-#=data.ns#field="${data.field}" data-#=data.ns#title="${data.title || ""}" data-#=data.ns#dir="${data.dir || "asc"}">' + '<a href="\\#" class="k-link">' + '<span class="k-icon k-i-sort-${(data.dir || "asc") == "asc" ? "asc-sm" : "desc-sm"}" title="(sorted ${(data.dir || "asc") == "asc" ? "ascending": "descending"})"></span>' + '${data.title ? data.title: data.field}' + '</a>' + '<a href="\\#" data-role="button" aria-label="Remove grouping by ${data.title || data.field} field" class="k-button k-button-icon k-flat">' + '<span class="k-icon k-i-close"></span>' + '</a>' + '</div>', { useWithBlock: false }), hint = function (target) {
                var title = target.attr(quilt.attr('title'));
                if (title) {
                    title = quilt.htmlEncode(title);
                }
                return $('<div class="k-header k-group-clue k-drag-clue" />').html(title || target.attr(quilt.attr('field'))).prepend('<span class="k-icon k-drag-status k-i-cancel"></span>');
            }, dropCue = $('<div class="k-grouping-dropclue"/>');
        var Groupable = Widget.extend({
            init: function (element, options) {
                var that = this, group = quilt.guid(), intializePositions = proxy(that._intializePositions, that), draggable, horizontalCuePosition, dropCuePositions = that._dropCuePositions = [];
                Widget.fn.init.call(that, element, options);
                isRtl = quilt.support.isRtl(element);
                horizontalCuePosition = isRtl ? 'right' : 'left';
                that.draggable = draggable = that.options.draggable || new quilt.ui.Draggable(that.element, {
                    filter: that.options.draggableElements,
                    hint: hint,
                    group: group
                });
                that.groupContainer = $(that.options.groupContainer, that.element).quiltDropTarget({
                    group: draggable.options.group,
                    dragenter: function (e) {
                        if (that._canDrag(e.draggable.currentTarget)) {
                            e.draggable.hint.find('.k-drag-status').removeClass('k-i-cancel').addClass('k-i-plus');
                            dropCue.css(horizontalCuePosition, 0).appendTo(that.groupContainer);
                        }
                    },
                    dragleave: function (e) {
                        e.draggable.hint.find('.k-drag-status').removeClass('k-i-plus').addClass('k-i-cancel');
                        dropCue.remove();
                    },
                    drop: function (e) {
                        var targetElement = e.draggable.currentTarget, field = targetElement.attr(quilt.attr('field')), title = targetElement.attr(quilt.attr('title')), sourceIndicator = that.indicator(field), dropCuePositions = that._dropCuePositions, lastCuePosition = dropCuePositions[dropCuePositions.length - 1], position;
                        var sortOptions = extend({}, that.options.sort, targetElement.data(GROUP_SORT));
                        var dir = sortOptions.dir;
                        if (!targetElement.hasClass('k-group-indicator') && !that._canDrag(targetElement)) {
                            return;
                        }
                        if (lastCuePosition) {
                            position = that._dropCuePosition(quilt.getOffset(dropCue).left + parseInt(lastCuePosition.element.css('marginLeft'), 10) * (isRtl ? -1 : 1) + parseInt(lastCuePosition.element.css('marginRight'), 10));
                            if (position && that._canDrop($(sourceIndicator), position.element, position.left)) {
                                if (position.before) {
                                    position.element.before(sourceIndicator || that.buildIndicator(field, title, dir));
                                } else {
                                    position.element.after(sourceIndicator || that.buildIndicator(field, title, dir));
                                }
                                that._setIndicatorSortOptions(field, sortOptions);
                                that._change();
                            }
                        } else {
                            that.groupContainer.empty();
                            that.groupContainer.append(that.buildIndicator(field, title, dir));
                            that._setIndicatorSortOptions(field, sortOptions);
                            that._change();
                        }
                    }
                }).quiltDraggable({
                    filter: 'div.k-group-indicator',
                    hint: hint,
                    group: draggable.options.group,
                    dragcancel: proxy(that._dragCancel, that),
                    dragstart: function (e) {
                        var element = e.currentTarget, marginLeft = parseInt(element.css('marginLeft'), 10), elementPosition = element.position(), left = isRtl ? elementPosition.left - marginLeft : elementPosition.left + outerWidth(element);
                        intializePositions();
                        dropCue.css('left', left).appendTo(that.groupContainer);
                        this.hint.find('.k-drag-status').removeClass('k-i-cancel').addClass('k-i-plus');
                    },
                    dragend: function () {
                        that._dragEnd(this);
                    },
                    drag: proxy(that._drag, that)
                }).on('click' + NS, '.k-button', function (e) {
                    e.preventDefault();
                    that._removeIndicator($(this).parent());
                }).on('click' + NS, '.k-link', function (e) {
                    var indicator = $(this).parent();
                    var newDir = indicator.attr(quiltAttr(DIR)) === ASCENDING ? DESCENDING : ASCENDING;
                    indicator.attr(quiltAttr(DIR), newDir);
                    that._change();
                    e.preventDefault();
                });
                draggable.bind([
                    'dragend',
                    'dragcancel',
                    'dragstart',
                    'drag'
                ], {
                    dragend: function () {
                        that._dragEnd(this);
                    },
                    dragcancel: proxy(that._dragCancel, that),
                    dragstart: function (e) {
                        var element, marginRight, left;
                        if (!that.options.allowDrag && !that._canDrag(e.currentTarget)) {
                            e.preventDefault();
                            return;
                        }
                        intializePositions();
                        if (dropCuePositions.length) {
                            element = dropCuePositions[dropCuePositions.length - 1].element;
                            marginRight = parseInt(element.css('marginRight'), 10);
                            left = element.position().left + outerWidth(element) + marginRight;
                        } else {
                            left = 0;
                        }
                    },
                    drag: proxy(that._drag, that)
                });
                that.dataSource = that.options.dataSource;
                if (that.dataSource && that._refreshHandler) {
                    that.dataSource.unbind(CHANGE, that._refreshHandler);
                } else {
                    that._refreshHandler = proxy(that.refresh, that);
                }
                if (that.dataSource) {
                    that.dataSource.bind('change', that._refreshHandler);
                    that.refresh();
                }
            },
            refresh: function () {
                var that = this, dataSource = that.dataSource;
                var groups = dataSource.group() || [];
                var fieldAttr = quiltAttr(FIELD);
                var titleAttr = quiltAttr(TITLE);
                var indicatorHtml;
                if (that.groupContainer) {
                    that.groupContainer.empty();
                    each(groups, function (index, group) {
                        var field = group.field;
                        var dir = group.dir;
                        var element = that.element.find(that.options.filter).filter(function () {
                            return $(this).attr(fieldAttr) === field;
                        });
                        indicatorHtml = that.buildIndicator(field, element.attr(titleAttr), dir);
                        that.groupContainer.append(indicatorHtml);
                        that._setIndicatorSortOptions(field, extend({}, that.options.sort, {
                            dir: dir,
                            compare: group.compare
                        }));
                    });
                }
                that._invalidateGroupContainer();
            },
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that.groupContainer.off(NS);
                if (that.groupContainer.data('quiltDropTarget')) {
                    that.groupContainer.data('quiltDropTarget').destroy();
                }
                if (that.groupContainer.data('quiltDraggable')) {
                    that.groupContainer.data('quiltDraggable').destroy();
                }
                if (!that.options.draggable) {
                    that.draggable.destroy();
                }
                if (that.dataSource && that._refreshHandler) {
                    that.dataSource.unbind('change', that._refreshHandler);
                    that._refreshHandler = null;
                }
                that.groupContainer = that.element = that.draggable = null;
            },
            events: ['change'],
            options: {
                name: 'Groupable',
                filter: 'th',
                draggableElements: 'th',
                messages: { empty: 'Drag a column header and drop it here to group by that column' },
                sort: {
                    dir: ASCENDING,
                    compare: null
                }
            },
            indicator: function (field) {
                var indicators = $('.k-group-indicator', this.groupContainer);
                return $.grep(indicators, function (item) {
                    return $(item).attr(quilt.attr('field')) === field;
                })[0];
            },
            buildIndicator: function (field, title, dir) {
                var that = this;
                var indicator = indicatorTmpl({
                    ns: quilt.ns,
                    field: field.replace(/"/g, '\''),
                    title: title,
                    dir: dir || (that.options.sort || {}).dir || ASCENDING
                });
                return indicator;
            },
            _setIndicatorSortOptions: function (field, options) {
                var indicator = $(this.indicator(field));
                indicator.data(GROUP_SORT, options);
            },
            aggregates: function () {
                var that = this;
                var names;
                var idx;
                var length;
                return that.element.find(that.options.filter).map(function () {
                    var cell = $(this), aggregate = cell.attr(quilt.attr('aggregates')), member = cell.attr(quilt.attr('field'));
                    if (aggregate && aggregate !== '') {
                        names = aggregate.split(',');
                        aggregate = [];
                        for (idx = 0, length = names.length; idx < length; idx++) {
                            aggregate.push({
                                field: member,
                                aggregate: names[idx]
                            });
                        }
                    }
                    return aggregate;
                }).toArray();
            },
            descriptors: function () {
                var that = this, indicators = $('.k-group-indicator', that.groupContainer), field, aggregates = that.aggregates();
                return $.map(indicators, function (item) {
                    item = $(item);
                    field = item.attr(quilt.attr('field'));
                    var sortOptions = that.options.sort || {};
                    var indicatorSortOptions = item.data(GROUP_SORT) || {};
                    return {
                        field: field,
                        dir: item.attr(quilt.attr('dir')),
                        aggregates: aggregates || [],
                        compare: indicatorSortOptions.compare || sortOptions.compare
                    };
                });
            },
            _removeIndicator: function (indicator) {
                var that = this;
                indicator.off();
                indicator.removeData();
                indicator.remove();
                that._invalidateGroupContainer();
                that._change();
            },
            _change: function () {
                var that = this;
                if (that.dataSource) {
                    var descriptors = that.descriptors();
                    if (that.trigger('change', { groups: descriptors })) {
                        that.refresh();
                        return;
                    }
                    that.dataSource.group(descriptors);
                }
            },
            _dropCuePosition: function (position) {
                var dropCuePositions = this._dropCuePositions;
                if (!dropCue.is(':visible') || dropCuePositions.length === 0) {
                    return;
                }
                position = Math.ceil(position);
                var lastCuePosition = dropCuePositions[dropCuePositions.length - 1], left = lastCuePosition.left, right = lastCuePosition.right, marginLeft = parseInt(lastCuePosition.element.css('marginLeft'), 10), marginRight = parseInt(lastCuePosition.element.css('marginRight'), 10);
                if (position >= right && !isRtl || position < left && isRtl) {
                    position = {
                        left: lastCuePosition.element.position().left + (!isRtl ? outerWidth(lastCuePosition.element) + marginRight : -marginLeft),
                        element: lastCuePosition.element,
                        before: false
                    };
                } else {
                    position = $.grep(dropCuePositions, function (item) {
                        return item.left <= position && position <= item.right || isRtl && position > item.right;
                    })[0];
                    if (position) {
                        position = {
                            left: isRtl ? position.element.position().left + outerWidth(position.element) + marginRight : position.element.position().left - marginLeft,
                            element: position.element,
                            before: true
                        };
                    }
                }
                return position;
            },
            _drag: function (event) {
                var position = this._dropCuePosition(event.x.location);
                if (position) {
                    dropCue.css({
                        left: position.left,
                        right: 'auto'
                    });
                }
            },
            _canDrag: function (element) {
                var field = element.attr(quilt.attr('field'));
                return element.attr(quilt.attr('groupable')) != 'false' && field && (element.hasClass('k-group-indicator') || !this.indicator(field));
            },
            _canDrop: function (source, target, position) {
                var next = source.next(), result = source[0] !== target[0] && (!next[0] || target[0] !== next[0] || (!isRtl && position > next.position().left || isRtl && position < next.position().left));
                return result;
            },
            _dragEnd: function (draggable) {
                var that = this, field = draggable.currentTarget.attr(quilt.attr('field')), sourceIndicator = that.indicator(field);
                if (draggable !== that.options.draggable && !draggable.dropped && sourceIndicator) {
                    that._removeIndicator($(sourceIndicator));
                }
                that._dragCancel();
            },
            _dragCancel: function () {
                dropCue.remove();
                this._dropCuePositions = [];
            },
            _intializePositions: function () {
                var that = this, indicators = $('.k-group-indicator', that.groupContainer), left;
                that._dropCuePositions = $.map(indicators, function (item) {
                    item = $(item);
                    left = quilt.getOffset(item).left;
                    return {
                        left: parseInt(left, 10),
                        right: parseInt(left + outerWidth(item), 10),
                        element: item
                    };
                });
            },
            _invalidateGroupContainer: function () {
                var groupContainer = this.groupContainer;
                if (groupContainer && groupContainer.is(':empty')) {
                    groupContainer.html(this.options.messages.empty);
                }
            }
        });
        quilt.ui.plugin(Groupable);
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.reorderable', [
        'quilt.core',
        'quilt.draganddrop'
    ], f);
}(function () {
    var __meta__ = {
        id: 'reorderable',
        name: 'Reorderable',
        category: 'framework',
        depends: [
            'core',
            'draganddrop'
        ],
        advanced: true
    };
    (function ($, undefined) {
        var quilt = window.quilt, outerWidth = quilt._outerWidth, outerHeight = quilt._outerHeight, getOffset = quilt.getOffset, Widget = quilt.ui.Widget, CHANGE = 'change', KREORDERABLE = 'k-reorderable';
        function toggleHintClass(hint, denied) {
            hint = $(hint);
            if (denied) {
                hint.find('.k-drag-status').removeClass('k-i-plus').addClass('k-i-cancel');
            } else {
                hint.find('.k-drag-status').removeClass('k-i-cancel').addClass('k-i-plus');
            }
        }
        var Reorderable = Widget.extend({
            init: function (element, options) {
                var that = this, draggable, group = quilt.guid() + '-reorderable';
                Widget.fn.init.call(that, element, options);
                element = that.element.addClass(KREORDERABLE);
                options = that.options;
                that.draggable = draggable = options.draggable || new quilt.ui.Draggable(element, {
                    group: group,
                    autoScroll: true,
                    filter: options.filter,
                    hint: options.hint
                });
                that.reorderDropCue = $('<div class="k-reorder-cue"></div></div>');
                element.find(draggable.options.filter).quiltDropTarget({
                    group: draggable.options.group,
                    dragenter: function (e) {
                        if (!that._draggable) {
                            return;
                        }
                        var dropTarget = this.element, offset;
                        var denied = !that._dropTargetAllowed(dropTarget) || that._isLastDraggable();
                        toggleHintClass(e.draggable.hint, denied);
                        if (!denied) {
                            offset = getOffset(dropTarget);
                            var left = offset.left;
                            if (options.inSameContainer && !options.inSameContainer({
                                    source: dropTarget,
                                    target: that._draggable,
                                    sourceIndex: that._index(dropTarget),
                                    targetIndex: that._index(that._draggable)
                                })) {
                                that._dropTarget = dropTarget;
                            } else {
                                if (that._index(dropTarget) > that._index(that._draggable)) {
                                    left += outerWidth(dropTarget);
                                }
                            }
                            that.reorderDropCue.css({
                                height: outerHeight(dropTarget),
                                top: offset.top,
                                left: left
                            }).appendTo(document.body);
                        }
                    },
                    dragleave: function (e) {
                        toggleHintClass(e.draggable.hint, true);
                        that.reorderDropCue.remove();
                        that._dropTarget = null;
                    },
                    drop: function () {
                        that._dropTarget = null;
                        if (!that._draggable) {
                            return;
                        }
                        var dropTarget = this.element;
                        var draggable = that._draggable;
                        if (that._dropTargetAllowed(dropTarget) && !that._isLastDraggable()) {
                            that.trigger(CHANGE, {
                                element: that._draggable,
                                target: dropTarget,
                                oldIndex: that._index(draggable),
                                newIndex: that._index(dropTarget),
                                position: getOffset(that.reorderDropCue).left > getOffset(dropTarget).left ? 'after' : 'before'
                            });
                        }
                    }
                });
                draggable.bind([
                    'dragcancel',
                    'dragend',
                    'dragstart',
                    'drag'
                ], {
                    dragcancel: function () {
                        that.reorderDropCue.remove();
                        that._draggable = null;
                        that._elements = null;
                    },
                    dragend: function () {
                        that.reorderDropCue.remove();
                        that._draggable = null;
                        that._elements = null;
                    },
                    dragstart: function (e) {
                        that._draggable = e.currentTarget;
                        that._elements = that.element.find(that.draggable.options.filter);
                    },
                    drag: function (e) {
                        if (!that._dropTarget || this.hint.find('.k-drag-status').hasClass('k-i-cancel')) {
                            return;
                        }
                        var dropStartOffset = getOffset(that._dropTarget).left;
                        var width = outerWidth(that._dropTarget);
                        if (e.pageX > dropStartOffset + width / 2) {
                            that.reorderDropCue.css({ left: dropStartOffset + width });
                        } else {
                            that.reorderDropCue.css({ left: dropStartOffset });
                        }
                    }
                });
            },
            options: {
                name: 'Reorderable',
                filter: '*'
            },
            events: [CHANGE],
            _isLastDraggable: function () {
                var inSameContainer = this.options.inSameContainer, draggable = this._draggable[0], elements = this._elements.get(), found = false, item;
                if (!inSameContainer) {
                    return false;
                }
                while (!found && elements.length > 0) {
                    item = elements.pop();
                    found = draggable !== item && inSameContainer({
                        source: draggable,
                        target: item,
                        sourceIndex: this._index(draggable),
                        targetIndex: this._index(item)
                    });
                }
                return !found;
            },
            _dropTargetAllowed: function (dropTarget) {
                var inSameContainer = this.options.inSameContainer, dragOverContainers = this.options.dragOverContainers, draggable = this._draggable;
                if (draggable[0] === dropTarget[0]) {
                    return false;
                }
                if (!inSameContainer || !dragOverContainers) {
                    return true;
                }
                if (inSameContainer({
                        source: draggable,
                        target: dropTarget,
                        sourceIndex: this._index(draggable),
                        targetIndex: this._index(dropTarget)
                    })) {
                    return true;
                }
                return dragOverContainers(this._index(draggable), this._index(dropTarget));
            },
            _index: function (element) {
                return this._elements.index(element);
            },
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that.element.find(that.draggable.options.filter).each(function () {
                    var item = $(this);
                    if (item.data('quiltDropTarget')) {
                        item.data('quiltDropTarget').destroy();
                    }
                });
                if (that.draggable) {
                    that.draggable.destroy();
                    that.draggable.element = that.draggable = null;
                }
                that.elements = that.reorderDropCue = that._elements = that._draggable = null;
            }
        });
        quilt.ui.plugin(Reorderable);
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.resizable', [
        'quilt.core',
        'quilt.draganddrop'
    ], f);
}(function () {
    var __meta__ = {
        id: 'resizable',
        name: 'Resizable',
        category: 'framework',
        depends: [
            'core',
            'draganddrop'
        ],
        advanced: true
    };
    (function ($, undefined) {
        var quilt = window.quilt, ui = quilt.ui, Widget = ui.Widget, proxy = $.proxy, isFunction = quilt.isFunction, extend = $.extend, HORIZONTAL = 'horizontal', VERTICAL = 'vertical', START = 'start', RESIZE = 'resize', RESIZEEND = 'resizeend';
        var Resizable = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                that.orientation = that.options.orientation.toLowerCase() != VERTICAL ? HORIZONTAL : VERTICAL;
                that._positionMouse = that.orientation == HORIZONTAL ? 'x' : 'y';
                that._position = that.orientation == HORIZONTAL ? 'left' : 'top';
                that._sizingDom = that.orientation == HORIZONTAL ? 'outerWidth' : 'outerHeight';
                that.draggable = new ui.Draggable(options.draggableElement || element, {
                    distance: 1,
                    filter: options.handle,
                    drag: proxy(that._resize, that),
                    dragcancel: proxy(that._cancel, that),
                    dragstart: proxy(that._start, that),
                    dragend: proxy(that._stop, that)
                });
                that.userEvents = that.draggable.userEvents;
            },
            events: [
                RESIZE,
                RESIZEEND,
                START
            ],
            options: {
                name: 'Resizable',
                orientation: HORIZONTAL
            },
            resize: function () {
            },
            _max: function (e) {
                var that = this, hintSize = that.hint ? that.hint[that._sizingDom]() : 0, size = that.options.max;
                return isFunction(size) ? size(e) : size !== undefined ? that._initialElementPosition + size - hintSize : size;
            },
            _min: function (e) {
                var that = this, size = that.options.min;
                return isFunction(size) ? size(e) : size !== undefined ? that._initialElementPosition + size : size;
            },
            _start: function (e) {
                var that = this, hint = that.options.hint, el = $(e.currentTarget);
                that._initialElementPosition = el.position()[that._position];
                that._initialMousePosition = e[that._positionMouse].startLocation;
                if (hint) {
                    that.hint = isFunction(hint) ? $(hint(el)) : hint;
                    that.hint.css({ position: 'absolute' }).css(that._position, that._initialElementPosition).appendTo(that.element);
                }
                that.trigger(START, e);
                that._maxPosition = that._max(e);
                that._minPosition = that._min(e);
                $(document.body).css('cursor', el.css('cursor'));
            },
            _resize: function (e) {
                var that = this, maxPosition = that._maxPosition, minPosition = that._minPosition, currentPosition = that._initialElementPosition + (e[that._positionMouse].location - that._initialMousePosition), position;
                position = minPosition !== undefined ? Math.max(minPosition, currentPosition) : currentPosition;
                that.position = position = maxPosition !== undefined ? Math.min(maxPosition, position) : position;
                if (that.hint) {
                    that.hint.toggleClass(that.options.invalidClass || '', position == maxPosition || position == minPosition).css(that._position, position);
                }
                that.resizing = true;
                that.trigger(RESIZE, extend(e, { position: position }));
            },
            _stop: function (e) {
                var that = this;
                if (that.hint) {
                    that.hint.remove();
                }
                that.resizing = false;
                that.trigger(RESIZEEND, extend(e, { position: that.position }));
                $(document.body).css('cursor', '');
            },
            _cancel: function (e) {
                var that = this;
                if (that.hint) {
                    that.position = undefined;
                    that.hint.css(that._position, that._initialElementPosition);
                    that._stop(e);
                }
            },
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                if (that.draggable) {
                    that.draggable.destroy();
                }
            },
            press: function (target) {
                if (!target) {
                    return;
                }
                var position = target.position(), that = this;
                that.userEvents.press(position.left, position.top, target[0]);
                that.targetPosition = position;
                that.target = target;
            },
            move: function (delta) {
                var that = this, orientation = that._position, position = that.targetPosition, current = that.position;
                if (current === undefined) {
                    current = position[orientation];
                }
                position[orientation] = current + delta;
                that.userEvents.move(position.left, position.top);
            },
            end: function () {
                this.userEvents.end();
                this.target = this.position = undefined;
            }
        });
        quilt.ui.plugin(Resizable);
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.sortable', ['quilt.draganddrop'], f);
}(function () {
    var __meta__ = {
        id: 'sortable',
        name: 'Sortable',
        category: 'framework',
        depends: ['draganddrop']
    };
    (function ($, undefined) {
        var quilt = window.quilt, Widget = quilt.ui.Widget, outerWidth = quilt._outerWidth, outerHeight = quilt._outerHeight, START = 'start', BEFORE_MOVE = 'beforeMove', MOVE = 'move', END = 'end', CHANGE = 'change', CANCEL = 'cancel', ACTION_SORT = 'sort', ACTION_REMOVE = 'remove', ACTION_RECEIVE = 'receive', DEFAULT_FILTER = '>*', MISSING_INDEX = -1;
        function containsOrEqualTo(parent, child) {
            try {
                return $.contains(parent, child) || parent == child;
            } catch (e) {
                return false;
            }
        }
        function defaultHint(element) {
            return element.clone();
        }
        function defaultPlaceholder(element) {
            return element.clone().removeAttr('id').css('visibility', 'hidden');
        }
        var Sortable = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                if (!that.options.placeholder) {
                    that.options.placeholder = defaultPlaceholder;
                }
                if (!that.options.hint) {
                    that.options.hint = defaultHint;
                }
                that.draggable = that._createDraggable();
            },
            events: [
                START,
                BEFORE_MOVE,
                MOVE,
                END,
                CHANGE,
                CANCEL
            ],
            options: {
                name: 'Sortable',
                hint: null,
                placeholder: null,
                filter: DEFAULT_FILTER,
                holdToDrag: false,
                disabled: null,
                container: null,
                connectWith: null,
                handler: null,
                cursorOffset: null,
                axis: null,
                ignore: null,
                autoScroll: false,
                cursor: 'auto',
                moveOnDragEnter: false
            },
            destroy: function () {
                this.draggable.destroy();
                Widget.fn.destroy.call(this);
            },
            _createDraggable: function () {
                var that = this, element = that.element, options = that.options;
                return new quilt.ui.Draggable(element, {
                    filter: options.filter,
                    hint: quilt.isFunction(options.hint) ? options.hint : $(options.hint),
                    holdToDrag: options.holdToDrag,
                    container: options.container ? $(options.container) : null,
                    cursorOffset: options.cursorOffset,
                    axis: options.axis,
                    ignore: options.ignore,
                    autoScroll: options.autoScroll,
                    dragstart: $.proxy(that._dragstart, that),
                    dragcancel: $.proxy(that._dragcancel, that),
                    drag: $.proxy(that._drag, that),
                    dragend: $.proxy(that._dragend, that)
                });
            },
            _dragstart: function (e) {
                var draggedElement = this.draggedElement = e.currentTarget, disabled = this.options.disabled, handler = this.options.handler, _placeholder = this.options.placeholder, placeholder = this.placeholder = quilt.isFunction(_placeholder) ? $(_placeholder.call(this, draggedElement)) : $(_placeholder);
                if (disabled && draggedElement.is(disabled)) {
                    e.preventDefault();
                } else if (handler && !$(e.initialTarget).is(handler)) {
                    e.preventDefault();
                } else {
                    if (this.trigger(START, {
                            item: draggedElement,
                            draggableEvent: e
                        })) {
                        e.preventDefault();
                    } else {
                        draggedElement.css('display', 'none');
                        draggedElement.before(placeholder);
                        this._setCursor();
                    }
                }
            },
            _dragcancel: function () {
                this._cancel();
                this.trigger(CANCEL, { item: this.draggedElement });
                this._resetCursor();
            },
            _drag: function (e) {
                var draggedElement = this.draggedElement, target = this._findTarget(e), targetCenter, cursorOffset = {
                        left: e.x.location,
                        top: e.y.location
                    }, offsetDelta, axisDelta = {
                        x: e.x.delta,
                        y: e.y.delta
                    }, direction, sibling, getSibling, axis = this.options.axis, moveOnDragEnter = this.options.moveOnDragEnter, eventData = {
                        item: draggedElement,
                        list: this,
                        draggableEvent: e
                    };
                if (axis === 'x' || axis === 'y') {
                    this._movementByAxis(axis, cursorOffset, axisDelta[axis], eventData);
                    return;
                }
                if (target) {
                    targetCenter = this._getElementCenter(target.element);
                    offsetDelta = {
                        left: Math.round(cursorOffset.left - targetCenter.left),
                        top: Math.round(cursorOffset.top - targetCenter.top)
                    };
                    $.extend(eventData, { target: target.element });
                    if (target.appendToBottom) {
                        this._movePlaceholder(target, null, eventData);
                        return;
                    }
                    if (target.appendAfterHidden) {
                        this._movePlaceholder(target, 'next', eventData);
                    }
                    if (this._isFloating(target.element)) {
                        if (axisDelta.x < 0 && moveOnDragEnter || !moveOnDragEnter && offsetDelta.left < 0) {
                            direction = 'prev';
                        } else if (axisDelta.x > 0 && moveOnDragEnter || !moveOnDragEnter && offsetDelta.left > 0) {
                            direction = 'next';
                        }
                    } else {
                        if (axisDelta.y < 0 && moveOnDragEnter || !moveOnDragEnter && offsetDelta.top < 0) {
                            direction = 'prev';
                        } else if (axisDelta.y > 0 && moveOnDragEnter || !moveOnDragEnter && offsetDelta.top > 0) {
                            direction = 'next';
                        }
                    }
                    if (direction) {
                        getSibling = direction === 'prev' ? jQuery.fn.prev : jQuery.fn.next;
                        sibling = getSibling.call(target.element);
                        while (sibling.length && !sibling.is(':visible')) {
                            sibling = getSibling.call(sibling);
                        }
                        if (sibling[0] != this.placeholder[0]) {
                            this._movePlaceholder(target, direction, eventData);
                        }
                    }
                }
            },
            _dragend: function (e) {
                var placeholder = this.placeholder, draggedElement = this.draggedElement, draggedIndex = this.indexOf(draggedElement), placeholderIndex = this.indexOf(placeholder), connectWith = this.options.connectWith, connectedList, isDefaultPrevented, eventData, connectedListEventData;
                this._resetCursor();
                eventData = {
                    action: ACTION_SORT,
                    item: draggedElement,
                    oldIndex: draggedIndex,
                    newIndex: placeholderIndex,
                    draggableEvent: e
                };
                if (placeholderIndex >= 0) {
                    isDefaultPrevented = this.trigger(END, eventData);
                } else {
                    connectedList = placeholder.parents(connectWith).getQuiltSortable();
                    eventData.action = ACTION_REMOVE;
                    connectedListEventData = $.extend({}, eventData, {
                        action: ACTION_RECEIVE,
                        oldIndex: MISSING_INDEX,
                        newIndex: connectedList.indexOf(placeholder)
                    });
                    isDefaultPrevented = !(!this.trigger(END, eventData) && !connectedList.trigger(END, connectedListEventData));
                }
                if (isDefaultPrevented || placeholderIndex === draggedIndex) {
                    this._cancel();
                    return;
                }
                placeholder.replaceWith(draggedElement);
                draggedElement.show();
                this.draggable.dropped = true;
                eventData = {
                    action: this.indexOf(draggedElement) != MISSING_INDEX ? ACTION_SORT : ACTION_REMOVE,
                    item: draggedElement,
                    oldIndex: draggedIndex,
                    newIndex: this.indexOf(draggedElement),
                    draggableEvent: e
                };
                this.trigger(CHANGE, eventData);
                if (connectedList) {
                    connectedListEventData = $.extend({}, eventData, {
                        action: ACTION_RECEIVE,
                        oldIndex: MISSING_INDEX,
                        newIndex: connectedList.indexOf(draggedElement)
                    });
                    connectedList.trigger(CHANGE, connectedListEventData);
                }
            },
            _findTarget: function (e) {
                var element = this._findElementUnderCursor(e), items, connectWith = this.options.connectWith, node;
                if ($.contains(this.element[0], element)) {
                    items = this.items();
                    node = items.filter(element)[0] || items.has(element)[0];
                    return node ? {
                        element: $(node),
                        sortable: this
                    } : null;
                } else if (this.element[0] == element && this._isEmpty()) {
                    return {
                        element: this.element,
                        sortable: this,
                        appendToBottom: true
                    };
                } else if (this.element[0] == element && this._isLastHidden()) {
                    node = this.items().eq(0);
                    return {
                        element: node,
                        sortable: this,
                        appendAfterHidden: true
                    };
                } else if (connectWith) {
                    return this._searchConnectedTargets(element, e);
                }
            },
            _findElementUnderCursor: function (e) {
                var elementUnderCursor = quilt.elementUnderCursor(e), draggable = e.sender;
                if (containsOrEqualTo(draggable.hint[0], elementUnderCursor)) {
                    draggable.hint.hide();
                    elementUnderCursor = quilt.elementUnderCursor(e);
                    if (!elementUnderCursor) {
                        elementUnderCursor = quilt.elementUnderCursor(e);
                    }
                    draggable.hint.show();
                }
                return elementUnderCursor;
            },
            _searchConnectedTargets: function (element, e) {
                var connected = $(this.options.connectWith), sortableInstance, items, node;
                for (var i = 0; i < connected.length; i++) {
                    sortableInstance = connected.eq(i).getQuiltSortable();
                    if ($.contains(connected[i], element)) {
                        if (sortableInstance) {
                            items = sortableInstance.items();
                            node = items.filter(element)[0] || items.has(element)[0];
                            if (node) {
                                sortableInstance.placeholder = this.placeholder;
                                return {
                                    element: $(node),
                                    sortable: sortableInstance
                                };
                            } else {
                                return null;
                            }
                        }
                    } else if (connected[i] == element) {
                        if (sortableInstance && sortableInstance._isEmpty()) {
                            return {
                                element: connected.eq(i),
                                sortable: sortableInstance,
                                appendToBottom: true
                            };
                        } else if (this._isCursorAfterLast(sortableInstance, e)) {
                            node = sortableInstance.items().last();
                            return {
                                element: node,
                                sortable: sortableInstance
                            };
                        }
                    }
                }
            },
            _isCursorAfterLast: function (sortable, e) {
                var lastItem = sortable.items().last(), cursorOffset = {
                        left: e.x.location,
                        top: e.y.location
                    }, lastItemOffset, delta;
                lastItemOffset = quilt.getOffset(lastItem);
                lastItemOffset.top += outerHeight(lastItem);
                lastItemOffset.left += outerWidth(lastItem);
                if (this._isFloating(lastItem)) {
                    delta = lastItemOffset.left - cursorOffset.left;
                } else {
                    delta = lastItemOffset.top - cursorOffset.top;
                }
                return delta < 0 ? true : false;
            },
            _movementByAxis: function (axis, cursorOffset, delta, eventData) {
                var cursorPosition = axis === 'x' ? cursorOffset.left : cursorOffset.top, target = delta < 0 ? this.placeholder.prev() : this.placeholder.next(), items = this.items(), targetCenter;
                if (target.length && !target.is(':visible')) {
                    target = delta < 0 ? target.prev() : target.next();
                }
                if (!items.filter(target).length) {
                    return;
                }
                $.extend(eventData, { target: target });
                targetCenter = this._getElementCenter(target);
                if (targetCenter) {
                    targetCenter = axis === 'x' ? targetCenter.left : targetCenter.top;
                }
                if (target.length && delta < 0 && cursorPosition - targetCenter < 0) {
                    this._movePlaceholder({
                        element: target,
                        sortable: this
                    }, 'prev', eventData);
                } else if (target.length && delta > 0 && cursorPosition - targetCenter > 0) {
                    this._movePlaceholder({
                        element: target,
                        sortable: this
                    }, 'next', eventData);
                }
            },
            _movePlaceholder: function (target, direction, eventData) {
                var placeholder = this.placeholder;
                if (!target.sortable.trigger(BEFORE_MOVE, eventData)) {
                    if (!direction) {
                        target.element.append(placeholder);
                    } else if (direction === 'prev') {
                        target.element.before(placeholder);
                    } else if (direction === 'next') {
                        target.element.after(placeholder);
                    }
                    target.sortable.trigger(MOVE, eventData);
                }
            },
            _setCursor: function () {
                var cursor = this.options.cursor, body;
                if (cursor && cursor !== 'auto') {
                    body = $(document.body);
                    this._originalCursorType = body.css('cursor');
                    body.css({ 'cursor': cursor });
                    if (!this._cursorStylesheet) {
                        this._cursorStylesheet = $('<style>* { cursor: ' + cursor + ' !important; }</style>');
                    }
                    this._cursorStylesheet.appendTo(body);
                }
            },
            _resetCursor: function () {
                if (this._originalCursorType) {
                    $(document.body).css('cursor', this._originalCursorType);
                    this._originalCursorType = null;
                    this._cursorStylesheet.remove();
                }
            },
            _getElementCenter: function (element) {
                var center = element.length ? quilt.getOffset(element) : null;
                if (center) {
                    center.top += outerHeight(element) / 2;
                    center.left += outerWidth(element) / 2;
                }
                return center;
            },
            _isFloating: function (item) {
                var isFloating = /left|right/.test(item.css('float'));
                var isTable = /inline|table-cell/.test(item.css('display'));
                var isHorizontalFlex = /flex/.test(item.parent().css('display')) && (/row|row-reverse/.test(item.parent().css('flex-direction')) || !item.parent().css('flex-direction'));
                return isFloating || isTable || isHorizontalFlex;
            },
            _cancel: function () {
                this.draggedElement.show();
                this.placeholder.remove();
                this.draggable.dropped = true;
            },
            _items: function () {
                var filter = this.options.filter, items;
                if (filter) {
                    items = this.element.find(filter);
                } else {
                    items = this.element.children();
                }
                return items;
            },
            indexOf: function (element) {
                var items = this._items(), placeholder = this.placeholder, draggedElement = this.draggedElement;
                if (placeholder && element[0] == placeholder[0]) {
                    return items.not(draggedElement).index(element);
                } else {
                    return items.not(placeholder).index(element);
                }
            },
            items: function () {
                var placeholder = this.placeholder, items = this._items();
                if (placeholder) {
                    items = items.not(placeholder);
                }
                return items;
            },
            _isEmpty: function () {
                return !this.items().length;
            },
            _isLastHidden: function () {
                return this.items().length === 1 && this.items().is(':hidden');
            }
        });
        quilt.ui.plugin(Sortable);
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.selectable', [
        'quilt.core',
        'quilt.userevents'
    ], f);
}(function () {
    var __meta__ = {
        id: 'selectable',
        name: 'Selectable',
        category: 'framework',
        depends: [
            'core',
            'userevents'
        ],
        advanced: true
    };
    (function ($, undefined) {
        var quilt = window.quilt, Widget = quilt.ui.Widget, proxy = $.proxy, abs = Math.abs, ARIASELECTED = 'aria-selected', SELECTED = 'k-state-selected', ACTIVE = 'k-state-selecting', SELECTABLE = 'k-selectable', CHANGE = 'change', NS = '.quiltSelectable', UNSELECT = 'unselect', UNSELECTING = 'k-state-unselecting', INPUTSELECTOR = 'input,a,textarea,.k-multiselect-wrap,select,button,.k-button>span,.k-button>img,span.k-icon.k-i-arrow-60-down,span.k-icon.k-i-arrow-60-up,label.k-checkbox-label.k-no-text,.k-icon.k-i-collapse,.k-icon.k-i-expand,span.k-numeric-wrap,.k-focusable', msie = quilt.support.browser.msie, supportEventDelegation = false, extend = $.extend;
        (function ($) {
            (function () {
                $('<div class="parent"><span></span></div>').on('click', '>*', function () {
                    supportEventDelegation = true;
                }).find('span').trigger('click').end().off();
            }());
        }($));
        var Selectable = Widget.extend({
            init: function (element, options) {
                var that = this, multiple;
                Widget.fn.init.call(that, element, options);
                that._marquee = $('<div class=\'k-marquee\'><div class=\'k-marquee-color\'></div></div>');
                that._lastActive = null;
                that.element.addClass(SELECTABLE);
                that.relatedTarget = that.options.relatedTarget;
                multiple = that.options.multiple;
                if (this.options.aria && multiple) {
                    that.element.attr('aria-multiselectable', true);
                }
                that.userEvents = new quilt.UserEvents(that.element, {
                    global: true,
                    allowSelection: true,
                    filter: (!supportEventDelegation ? '.' + SELECTABLE + ' ' : '') + that.options.filter,
                    tap: proxy(that._tap, that),
                    touchAction: multiple ? 'none' : 'pan-x pan-y'
                });
                if (multiple) {
                    that.userEvents.bind('start', proxy(that._start, that)).bind('move', proxy(that._move, that)).bind('end', proxy(that._end, that)).bind('select', proxy(that._select, that));
                }
            },
            events: [
                CHANGE,
                UNSELECT
            ],
            options: {
                name: 'Selectable',
                filter: '>*',
                inputSelectors: INPUTSELECTOR,
                multiple: false,
                relatedTarget: $.noop,
                ignoreOverlapped: false,
                addIdToRanges: false
            },
            _isElement: function (target) {
                var elements = this.element;
                var idx, length = elements.length, result = false;
                target = target[0];
                for (idx = 0; idx < length; idx++) {
                    if (elements[idx] === target) {
                        result = true;
                        break;
                    }
                }
                return result;
            },
            _tap: function (e) {
                var target = $(e.target), that = this, ctrlKey = e.event.ctrlKey || e.event.metaKey, multiple = that.options.multiple, shiftKey = multiple && e.event.shiftKey, selected, whichCode = e.event.which, buttonCode = e.event.button;
                if (!that._isElement(target.closest('.' + SELECTABLE)) || whichCode && whichCode == 3 || buttonCode && buttonCode == 2) {
                    return;
                }
                if (!this._allowSelection(e.event.target)) {
                    return;
                }
                selected = target.hasClass(SELECTED);
                if (!multiple || !ctrlKey) {
                    that.clear();
                }
                target = target.add(that.relatedTarget(target));
                if (shiftKey) {
                    that.selectRange(that._firstSelectee(), target, e);
                } else {
                    if (selected && ctrlKey) {
                        that._unselect(target);
                        that._notify(CHANGE, e);
                    } else {
                        that.value(target, e);
                    }
                    that._lastActive = that._downTarget = target;
                }
            },
            _start: function (e) {
                var that = this, target = $(e.target), selected = target.hasClass(SELECTED), currentElement, ctrlKey = e.event.ctrlKey || e.event.metaKey;
                if (!this._allowSelection(e.event.target)) {
                    return;
                }
                that._downTarget = target;
                if (!that._isElement(target.closest('.' + SELECTABLE))) {
                    that.userEvents.cancel();
                    return;
                }
                if (that.options.useAllItems) {
                    that._items = that.element.find(that.options.filter);
                } else {
                    currentElement = target.closest(that.element);
                    that._items = currentElement.find(that.options.filter);
                }
                e.sender.capture();
                that._marquee.appendTo(document.body).css({
                    left: e.x.client + 1,
                    top: e.y.client + 1,
                    width: 0,
                    height: 0
                });
                if (!ctrlKey) {
                    that.clear();
                }
                target = target.add(that.relatedTarget(target));
                if (selected) {
                    that._selectElement(target, true);
                    if (ctrlKey) {
                        target.addClass(UNSELECTING);
                    }
                }
            },
            _move: function (e) {
                var that = this, position = {
                        left: e.x.startLocation > e.x.location ? e.x.location : e.x.startLocation,
                        top: e.y.startLocation > e.y.location ? e.y.location : e.y.startLocation,
                        width: abs(e.x.initialDelta),
                        height: abs(e.y.initialDelta)
                    };
                that._marquee.css(position);
                that._invalidateSelectables(position, e.event.ctrlKey || e.event.metaKey);
                e.preventDefault();
            },
            _end: function (e) {
                var that = this, rangeSelectedAttr = quilt.attr('range-selected'), uid = quilt.guid();
                that._marquee.remove();
                that._unselect(that.element.find(that.options.filter + '.' + UNSELECTING)).removeClass(UNSELECTING);
                var target = that.element.find(that.options.filter + '.' + ACTIVE);
                target = target.add(that.relatedTarget(target));
                if (that.options.addIdToRanges) {
                    for (var i = 0; i < that._currentlyActive.length; i++) {
                        $(that._currentlyActive[i]).attr(rangeSelectedAttr, uid);
                    }
                }
                that.value(target, e);
                that._lastActive = that._downTarget;
                that._items = null;
            },
            _invalidateSelectables: function (position, ctrlKey) {
                var idx, length, target = this._downTarget[0], items = this._items, related, toSelect;
                this._currentlyActive = [];
                for (idx = 0, length = items.length; idx < length; idx++) {
                    toSelect = items.eq(idx);
                    related = toSelect.add(this.relatedTarget(toSelect));
                    if (collision(toSelect, position)) {
                        if (toSelect.hasClass(SELECTED)) {
                            if (ctrlKey && target !== toSelect[0]) {
                                related.removeClass(SELECTED).addClass(UNSELECTING);
                            }
                        } else if (!toSelect.hasClass(ACTIVE) && !toSelect.hasClass(UNSELECTING) && !this._collidesWithActiveElement(related, position)) {
                            related.addClass(ACTIVE);
                        }
                        this._currentlyActive.push(related[0]);
                    } else {
                        if (toSelect.hasClass(ACTIVE)) {
                            related.removeClass(ACTIVE);
                        } else if (ctrlKey && toSelect.hasClass(UNSELECTING)) {
                            related.removeClass(UNSELECTING).addClass(SELECTED);
                        }
                    }
                }
            },
            _collidesWithActiveElement: function (element, marqueeRect) {
                if (!this.options.ignoreOverlapped) {
                    return false;
                }
                var activeElements = this._currentlyActive;
                var elemRect = element[0].getBoundingClientRect();
                var activeElementRect;
                var collision = false;
                var isRtl = quilt.support.isRtl(element);
                var leftRight = isRtl ? 'right' : 'left';
                var tempRect = {};
                marqueeRect.right = marqueeRect.left + marqueeRect.width;
                marqueeRect.bottom = marqueeRect.top + marqueeRect.height;
                for (var i = 0; i < activeElements.length; i++) {
                    activeElementRect = activeElements[i].getBoundingClientRect();
                    if (overlaps(elemRect, activeElementRect)) {
                        tempRect[leftRight] = leftRight === 'left' ? activeElementRect.right : activeElementRect.left;
                        elemRect = extend({}, elemRect, tempRect);
                        if (elemRect.left > elemRect.right) {
                            return true;
                        }
                        collision = !overlaps(elemRect, marqueeRect);
                    }
                }
                return collision;
            },
            value: function (val, e) {
                var that = this, selectElement = proxy(that._selectElement, that);
                if (val) {
                    val.each(function () {
                        selectElement(this);
                    });
                    that._notify(CHANGE, e);
                    return;
                }
                return that.element.find(that.options.filter + '.' + SELECTED);
            },
            selectedRanges: function () {
                var that = this;
                var rangeSelectedAttr = quilt.attr('range-selected');
                var map = {};
                that.element.find('[' + rangeSelectedAttr + ']').each(function (_, elem) {
                    var rangeId = $(elem).attr(rangeSelectedAttr);
                    var mapLocation = map[rangeId];
                    if (!mapLocation) {
                        mapLocation = map[rangeId] = [];
                    }
                    mapLocation.push($(elem));
                });
                return map;
            },
            selectedSingleItems: function () {
                var that = this;
                var rangeSelectedAttr = quilt.attr('range-selected');
                return that.element.find(that.options.filter + '.' + SELECTED + ':not([' + rangeSelectedAttr + '])').toArray().map(function (elem) {
                    return $(elem);
                });
            },
            _firstSelectee: function () {
                var that = this, selected;
                if (that._lastActive !== null) {
                    return that._lastActive;
                }
                selected = that.value();
                return selected.length > 0 ? selected[0] : that.element.find(that.options.filter)[0];
            },
            _selectElement: function (element, preventNotify) {
                var toSelect = $(element), isPrevented = !preventNotify && this._notify('select', { element: element });
                toSelect.removeClass(ACTIVE);
                if (!isPrevented) {
                    toSelect.addClass(SELECTED);
                    if (this.options.aria) {
                        toSelect.attr(ARIASELECTED, true);
                    }
                }
            },
            _notify: function (name, args) {
                args = args || {};
                return this.trigger(name, args);
            },
            _unselect: function (element) {
                if (this.trigger(UNSELECT, { element: element })) {
                    return;
                }
                var rangeSelectedAttr = quilt.attr('range-selected');
                element.removeClass(SELECTED).removeAttr(rangeSelectedAttr);
                if (this.options.aria) {
                    element.attr(ARIASELECTED, false);
                }
                return element;
            },
            _select: function (e) {
                if (this._allowSelection(e.event.target)) {
                    if (!msie || msie && !$(quilt._activeElement()).is(this.options.inputSelectors)) {
                        e.preventDefault();
                    }
                }
            },
            _allowSelection: function (target) {
                if ($(target).is(this.options.inputSelectors)) {
                    this.userEvents.cancel();
                    this._downTarget = null;
                    return false;
                }
                return true;
            },
            resetTouchEvents: function () {
                this.userEvents.cancel();
            },
            clear: function () {
                var items = this.element.find(this.options.filter + '.' + SELECTED);
                this._unselect(items);
            },
            selectRange: function (start, end, e) {
                var that = this, idx, tmp, items;
                that.clear();
                if (that.element.length > 1) {
                    items = that.options.continuousItems();
                }
                if (!items || !items.length) {
                    items = that.element.find(that.options.filter);
                }
                start = $.inArray($(start)[0], items);
                end = $.inArray($(end)[0], items);
                if (start > end) {
                    tmp = start;
                    start = end;
                    end = tmp;
                }
                if (!that.options.useAllItems) {
                    end += that.element.length - 1;
                }
                for (idx = start; idx <= end; idx++) {
                    that._selectElement(items[idx]);
                }
                that._notify(CHANGE, e);
            },
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that.element.off(NS);
                that.userEvents.destroy();
                that._marquee = that._lastActive = that.element = that.userEvents = null;
            }
        });
        Selectable.parseOptions = function (selectable) {
            var selectableMode = selectable.mode || selectable;
            var asLowerString = typeof selectableMode === 'string' && selectableMode.toLowerCase();
            return {
                multiple: asLowerString && asLowerString.indexOf('multiple') > -1,
                cell: asLowerString && asLowerString.indexOf('cell') > -1
            };
        };
        function collision(element, position) {
            if (!element.is(':visible')) {
                return false;
            }
            var elementPosition = quilt.getOffset(element), right = position.left + position.width, bottom = position.top + position.height;
            elementPosition.right = elementPosition.left + quilt._outerWidth(element);
            elementPosition.bottom = elementPosition.top + quilt._outerHeight(element);
            return !(elementPosition.left > right || elementPosition.right < position.left || elementPosition.top > bottom || elementPosition.bottom < position.top);
        }
        function overlaps(firstRect, secondRect) {
            return !(firstRect.right <= secondRect.left || firstRect.left >= secondRect.right || firstRect.bottom <= secondRect.top || firstRect.top >= secondRect.bottom);
        }
        quilt.ui.plugin(Selectable);
    }(window.quilt.jQuery));
    return window.quilt;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('quilt.color', ['quilt.core'], f);
}(function () {
    var __meta__ = {
        id: 'color',
        name: 'Color utils',
        category: 'framework',
        advanced: true,
        description: 'Color utilities used across components',
        depends: ['core']
    };
    window.quilt = window.quilt || {};
    var Class = quilt.Class;
    var namedColors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgrey: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkslategrey: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dimgrey: '696969',
        dodgerblue: '1e90ff',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        grey: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred: 'cd5c5c',
        indigo: '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgray: 'd3d3d3',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslategray: '778899',
        lightslategrey: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        slategrey: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    var matchNamedColor = function (color) {
        var colorNames = Object.keys(namedColors);
        colorNames.push('transparent');
        var regexp = new RegExp('^(' + colorNames.join('|') + ')(\\W|$)', 'i');
        matchNamedColor = function (color) {
            return regexp.exec(color);
        };
        return regexp.exec(color);
    };
    var BaseColor = Class.extend({
        init: function () {
        },
        toHSV: function () {
            return this;
        },
        toRGB: function () {
            return this;
        },
        toHex: function () {
            return this.toBytes().toHex();
        },
        toBytes: function () {
            return this;
        },
        toCss: function () {
            return '#' + this.toHex();
        },
        toCssRgba: function () {
            var rgb = this.toBytes();
            return 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + parseFloat(Number(this.a).toFixed(3)) + ')';
        },
        toDisplay: function () {
            return this.toCssRgba();
        },
        equals: function (c) {
            return c === this || c !== null && this.toCssRgba() === parseColor(c).toCssRgba();
        },
        diff: function (other) {
            if (other === null) {
                return NaN;
            }
            var c1 = this.toBytes();
            var c2 = other.toBytes();
            return Math.sqrt(Math.pow((c1.r - c2.r) * 0.3, 2) + Math.pow((c1.g - c2.g) * 0.59, 2) + Math.pow((c1.b - c2.b) * 0.11, 2));
        },
        clone: function () {
            var c = this.toBytes();
            if (c === this) {
                c = new Bytes(c.r, c.g, c.b, c.a);
            }
            return c;
        }
    });
    var RGB = BaseColor.extend({
        init: function (r, g, b, a) {
            BaseColor.fn.init.call(this);
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        },
        toHSV: function () {
            var ref = this;
            var r = ref.r;
            var g = ref.g;
            var b = ref.b;
            var min = Math.min(r, g, b);
            var max = Math.max(r, g, b);
            var delta = max - min;
            var v = max;
            var h, s;
            if (delta === 0) {
                return new HSV(0, 0, v, this.a);
            }
            if (max !== 0) {
                s = delta / max;
                if (r === max) {
                    h = (g - b) / delta;
                } else if (g === max) {
                    h = 2 + (b - r) / delta;
                } else {
                    h = 4 + (r - g) / delta;
                }
                h *= 60;
                if (h < 0) {
                    h += 360;
                }
            } else {
                s = 0;
                h = -1;
            }
            return new HSV(h, s, v, this.a);
        },
        toHSL: function () {
            var ref = this;
            var r = ref.r;
            var g = ref.g;
            var b = ref.b;
            var max = Math.max(r, g, b);
            var min = Math.min(r, g, b);
            var h, s, l = (max + min) / 2;
            if (max === min) {
                h = s = 0;
            } else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
                default:
                    break;
                }
            }
            return new HSL(h * 60, s * 100, l * 100, this.a);
        },
        toBytes: function () {
            return new Bytes(this.r * 255, this.g * 255, this.b * 255, this.a);
        }
    });
    var Bytes = RGB.extend({
        init: function (r, g, b, a) {
            RGB.fn.init.call(this, Math.round(r), Math.round(g), Math.round(b), a);
        },
        toRGB: function () {
            return new RGB(this.r / 255, this.g / 255, this.b / 255, this.a);
        },
        toHSV: function () {
            return this.toRGB().toHSV();
        },
        toHSL: function () {
            return this.toRGB().toHSL();
        },
        toHex: function () {
            return hex(this.r, 2) + hex(this.g, 2) + hex(this.b, 2);
        },
        toBytes: function () {
            return this;
        }
    });
    function hex(n, width, pad) {
        if (pad === void 0) {
            pad = '0';
        }
        var result = n.toString(16);
        while (width > result.length) {
            result = pad + result;
        }
        return result;
    }
    var HSV = BaseColor.extend({
        init: function (h, s, v, a) {
            BaseColor.fn.init.call(this);
            this.h = h;
            this.s = s;
            this.v = v;
            this.a = a;
        },
        toRGB: function () {
            var ref = this;
            var h = ref.h;
            var s = ref.s;
            var v = ref.v;
            var r, g, b;
            if (s === 0) {
                r = g = b = v;
            } else {
                h /= 60;
                var i = Math.floor(h);
                var f = h - i;
                var p = v * (1 - s);
                var q = v * (1 - s * f);
                var t = v * (1 - s * (1 - f));
                switch (i) {
                case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;
                case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;
                case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;
                case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;
                case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;
                default:
                    r = v;
                    g = p;
                    b = q;
                    break;
                }
            }
            return new RGB(r, g, b, this.a);
        },
        toHSL: function () {
            return this.toRGB().toHSL();
        },
        toBytes: function () {
            return this.toRGB().toBytes();
        }
    });
    var HSL = BaseColor.extend({
        init: function (h, s, l, a) {
            BaseColor.fn.init.call(this);
            this.h = h;
            this.s = s;
            this.l = l;
            this.a = a;
        },
        toRGB: function () {
            var h = this.h / 360;
            var s = this.s / 100;
            var l = this.l / 100;
            var r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return new RGB(r, g, b, this.a);
        },
        toHSV: function () {
            return this.toRGB().toHSV();
        },
        toBytes: function () {
            return this.toRGB().toBytes();
        }
    });
    function hue2rgb(p, q, s) {
        var t = s;
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    }
    function parseColor(value, safe) {
        var m, ret;
        if (value == null || value === 'none') {
            return null;
        }
        if (value instanceof BaseColor) {
            return value;
        }
        var color = value.toLowerCase();
        if (m = matchNamedColor(color)) {
            if (m[1] === 'transparent') {
                color = new RGB(1, 1, 1, 0);
            } else {
                color = parseColor(namedColors[m[1]], safe);
            }
            color.match = [m[1]];
            return color;
        }
        if (m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})\b/i.exec(color)) {
            ret = new Bytes(parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16), 1);
        } else if (m = /^#?([0-9a-f])([0-9a-f])([0-9a-f])\b/i.exec(color)) {
            ret = new Bytes(parseInt(m[1] + m[1], 16), parseInt(m[2] + m[2], 16), parseInt(m[3] + m[3], 16), 1);
        } else if (m = /^rgb\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/.exec(color)) {
            ret = new Bytes(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10), 1);
        } else if (m = /^rgba\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9.]+)\s*\)/.exec(color)) {
            ret = new Bytes(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10), parseFloat(m[4]));
        } else if (m = /^rgb\(\s*([0-9]*\.?[0-9]+)%\s*,\s*([0-9]*\.?[0-9]+)%\s*,\s*([0-9]*\.?[0-9]+)%\s*\)/.exec(color)) {
            ret = new RGB(parseFloat(m[1]) / 100, parseFloat(m[2]) / 100, parseFloat(m[3]) / 100, 1);
        } else if (m = /^rgba\(\s*([0-9]*\.?[0-9]+)%\s*,\s*([0-9]*\.?[0-9]+)%\s*,\s*([0-9]*\.?[0-9]+)%\s*,\s*([0-9.]+)\s*\)/.exec(color)) {
            ret = new RGB(parseFloat(m[1]) / 100, parseFloat(m[2]) / 100, parseFloat(m[3]) / 100, parseFloat(m[4]));
        }
        if (ret) {
            ret.match = m;
        } else if (!safe) {
            throw new Error('Cannot parse color: ' + color);
        }
        return ret;
    }
    var DARK_TRESHOLD = 180;
    var Color = Class.extend({
        init: function (value) {
            var this$1 = this;
            if (arguments.length === 1) {
                var formats = Color.formats;
                var resolvedColor = this.resolveColor(value);
                for (var idx = 0; idx < formats.length; idx++) {
                    var formatRegex = formats[idx].re;
                    var processor = formats[idx].process;
                    var parts = formatRegex.exec(resolvedColor);
                    if (parts) {
                        var channels = processor(parts);
                        this$1.r = channels[0];
                        this$1.g = channels[1];
                        this$1.b = channels[2];
                    }
                }
            } else {
                this.r = arguments[0];
                this.g = arguments[1];
                this.b = arguments[2];
            }
            this.r = this.normalizeByte(this.r);
            this.g = this.normalizeByte(this.g);
            this.b = this.normalizeByte(this.b);
        },
        toHex: function () {
            var pad = this.padDigit;
            var r = this.r.toString(16);
            var g = this.g.toString(16);
            var b = this.b.toString(16);
            return '#' + pad(r) + pad(g) + pad(b);
        },
        resolveColor: function (value) {
            var color = value || 'black';
            if (color.charAt(0) === '#') {
                color = color.substr(1, 6);
            }
            color = color.replace(/ /g, '');
            color = color.toLowerCase();
            color = Color.namedColors[color] || color;
            return color;
        },
        normalizeByte: function (value) {
            if (value < 0 || isNaN(value)) {
                return 0;
            }
            return value > 255 ? 255 : value;
        },
        padDigit: function (value) {
            return value.length === 1 ? '0' + value : value;
        },
        brightness: function (value) {
            var round = Math.round;
            this.r = round(this.normalizeByte(this.r * value));
            this.g = round(this.normalizeByte(this.g * value));
            this.b = round(this.normalizeByte(this.b * value));
            return this;
        },
        percBrightness: function () {
            return Math.sqrt(0.241 * this.r * this.r + 0.691 * this.g * this.g + 0.068 * this.b * this.b);
        },
        isDark: function () {
            return this.percBrightness() < DARK_TRESHOLD;
        }
    });
    Color.fromBytes = function (r, g, b, a) {
        return new Bytes(r, g, b, a != null ? a : 1);
    };
    Color.fromRGB = function (r, g, b, a) {
        return new RGB(r, g, b, a != null ? a : 1);
    };
    Color.fromHSV = function (h, s, v, a) {
        return new HSV(h, s, v, a != null ? a : 1);
    };
    Color.fromHSL = function (h, s, l, a) {
        return new HSL(h, s, l, a != null ? a : 1);
    };
    Color.formats = [
        {
            re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            process: function (parts) {
                return [
                    parseInt(parts[1], 10),
                    parseInt(parts[2], 10),
                    parseInt(parts[3], 10)
                ];
            }
        },
        {
            re: /^(\w{2})(\w{2})(\w{2})$/,
            process: function (parts) {
                return [
                    parseInt(parts[1], 16),
                    parseInt(parts[2], 16),
                    parseInt(parts[3], 16)
                ];
            }
        },
        {
            re: /^(\w{1})(\w{1})(\w{1})$/,
            process: function (parts) {
                return [
                    parseInt(parts[1] + parts[1], 16),
                    parseInt(parts[2] + parts[2], 16),
                    parseInt(parts[3] + parts[3], 16)
                ];
            }
        }
    ];
    Color.namedColors = namedColors;
    quilt.deepExtend(quilt, {
        parseColor: parseColor,
        namedColors: namedColors,
        Color: Color
    });
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
