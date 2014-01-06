const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Mainloop = imports.mainloop;
const Soup = imports.gi.Soup;

let button,rate,oldvalue,newvalue,cur,valuequeue;

function init() {
    button = new St.Bin({ style_class: 'panel-label',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true,
    			  });

    rate = new St.Label({ text: "NA"});

    cur = "EUR";
    button.set_child(rate);
    button.connect('button-press-event', _changeCurrency);
    _changeRate();
    Mainloop.timeout_add_seconds(60, Lang.bind(this, function (){
	   	 return this._changeRate();
    }));
}

function _changeCurrency()
{
	if(cur=="EUR")
		cur = "USD";
	else
		cur = "EUR";
	_changeRate(true);
}

function _changeRate(changedCur){
	const _httpSession = new Soup.SessionAsync();
	Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault());

	var ticker = {};
	var crate;

	global.log("update rate");

	var url = 'https://mtgox.com/api/1/BTC' + cur + '/public/ticker';
	let message = Soup.Message.new('GET', url);
        _httpSession.queue_message(message, function(_httpSession, message) {
            var tickerJSON = message.response_body.data;
	    crate = JSON.parse(tickerJSON);
    	    _setValue(crate,changedCur);
        });
	return true;
}

function _setValue(newvalue,changedCur){
	var b = JSON.stringify(newvalue.return.last.value);
	b = b.substring(1,b.length-4);
	rate.text = b;

	if(cur=="EUR")
		rate.text += " €";
	else
		rate.text += " $";
	
	if(!changedCur)
	{
		if(parseFloat(b) > oldvalue)
		{
			rate.style_class = 'higher';
		}
		else if(parseFloat(b) < oldvalue)
		{
			rate.style_class = 'lower';
		}
	}

	
	oldvalue = parseFloat(b);
	global.log(b);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
