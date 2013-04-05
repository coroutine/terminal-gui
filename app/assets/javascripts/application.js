// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require_tree .




/*--------------------------------------------------------------------
  This object declares a simple map to make key codes more 
  expressive.
--------------------------------------------------------------------*/

var Event = {
    KEY_LEFT:   37,
    KEY_RIGHT:  39,
    KEY_UP:     38,
    KEY_DOWN:   40,
    KEY_DELETE: 46
};



/*--------------------------------------------------------------------
  This object declares a namespace in which all the one-off scripts 
  required by the application.
--------------------------------------------------------------------*/

// This is the application object.
var App  = {
	
	// object references
	__terminal:     null 
};


// This function adjusts the scrolling of the document depending on the 
// viewport height.
App.adjustScrollTop = function() {
	
	// get all view references
	var d = document.documentElement;
	var b = document.body;
	var h = (window.innerHeight) ? window.innerHeight : d.clientHeight;
	
	// if view port overflow, force scroll to bottom
	if (d.scrollHeight > h + 4) {		// +4 adds padding back in
		d.scrollTop = d.scrollHeight;
		b.scrollTop = d.scrollHeight;		
	}
};


// This function returns the terminal object.
App.getTerminal = function() {
	if (!this.__terminal) {
		this.__terminal = new App.Terminal();
	}
	return this.__terminal;
};




/*--------------------------------------------------------------------
  This object declares a class in which the scripts controlling
  the terminal are defined.
--------------------------------------------------------------------*/

// This is the terminal object.
App.Terminal = function() {
	
	// object references
	this.__prompt = null;
};


// This function regurgitates the prompt line into the output area.
App.Terminal.prototype.appendPromptToOutput = function() {

	// get reference to prompt object
	var prompt = this.getPrompt();
	
	// build output string
	var s =	"<div>" + 
			prompt.getLabelElement().innerHTML + 
			" " +
			prompt.getBeforeElement().innerHTML +
			prompt.getCursorElement().innerHTML + 
			prompt.getAfterElement().innerHTML + 
			"</div>";
			
	// add string to output
	$('#OutputContainer').append(s);		
};


// This function returns a reference to the prompt object.
App.Terminal.prototype.getPrompt = function() {
	if (!this.__prompt) {
		this.__prompt = new App.Prompt();
	}
	return this.__prompt;
};




/*--------------------------------------------------------------------
  This object declares a class in which the scripts controlling
  the terminal prompt are defined.
--------------------------------------------------------------------*/

App.Prompt = function() {
	
	// dom references
	this.__inputElement 	= null;
	this.__hiddenElement 	= null;
	this.__labelElement 	= null;
	this.__beforeElement 	= null;
	this.__cursorElement 	= null;
	this.__afterElement 	= null;
	
	// object references
	this.__history			= new App.PromptHistory();
	
	// state references
	this.__cursorPosition 	= 0;
	this.__hasFocus			= false;
	this.__isCursorVisible	= true;
	this.__previousLength	= 0;
	this.__unprocessedText	= '';
	
	// helper references	
	this.__focusTimer 		= null;
};
	
	 
// This function clears the prompt fields of user-entered data and resets any
// related state variables.
App.Prompt.prototype.__clear = function() {
	this.getInputElement().value		= '';
	this.getHiddenElement().value 		= '';
	this.getBeforeElement().innerHTML 	= '';
	this.getCursorElement().innerHTML 	= '&nbsp;';
	this.getAfterElement().innerHTML  	= '';
	this.__cursorPosition				= 0;
	this.__previousLength				= 0;
	this.__unprocessedText				= '';
};


// This function transfers values typed into the hidden text field to
// the display-only fields acting as the stdin.  This is a private
// function.
App.Prompt.prototype.__handleKeyUpEvent = function(evt) {
	
	// get key working values
	var unescaped = this.getInputElement().value;
	var position  = this.__cursorPosition;
	var oldLength = this.__previousLength;
	var newLength = unescaped.length

	// adjust position for special cases
	if (evt.keyCode == Event.KEY_LEFT && position > 0) {
		position--;
	}
	else if (evt.keyCode == Event.KEY_RIGHT && position < newLength) {
		position++;
	}
	else if (evt.keyCode == Event.KEY_DELETE && position <= newLength) {
		position = position - (newLength - oldLength)
	}
	
	// perform default position adjustment
	position = position + (newLength - oldLength)

	// parse text field based on state
	if (position == 0) {
		var before = "";
		var cursor = (newLength > 0) ? unescaped.charAt(0) 			     : " ";
		var after  = (newLength > 0) ? unescaped.substring(1, newLength) : "";
	}
	else if (position == newLength) {
		var before = unescaped
		var cursor = " "
		var after  = "";
	}
	else {
		var before = unescaped.substring(0, position);
		var cursor = unescaped.charAt(position);
		var after  = unescaped.substring(position + 1, newLength);			
	}

	// reset view
	this.getHiddenElement().value		= unescaped;
	this.getBeforeElement().innerHTML 	= before.replace(/\s/g, "&nbsp;");
	this.getCursorElement().innerHTML 	= cursor.replace(/\s/g, "&nbsp;");
	this.getAfterElement().innerHTML  	= after.replace(/\s/g, "&nbsp;");
	
	// save new state
	this.__cursorPosition		= position;
	this.__previousLength		= newLength;
};


// This function transfers values typed into the hidden text field to
// the display-only fields acting as the stdin.  This is a private
// function.
App.Prompt.prototype.__loadCommandHistory = function(evt) {
	
	// if history in default position, we need to hang onto the current input
	// (if any)--the prompt, not the history, is responsible for this info.
	if (this.__history.isDefaultPosition()) {
		this.__unprocessedText = this.getInputElement().value;
	}
	
	// ask history object to make sense of the request and return 
	// a string value or null
	var newValue = null;
	if (evt.keyCode == Event.KEY_UP) {
		newValue = this.__history.getPrevious();
	}
	else {
		newValue = this.__history.getNext();
	}
	
	// if command not null, update view in place
	if (newValue != null) {
		
		// if newValue is empty string, use saved value
		if (newValue == "") {
			newValue = this.__unprocessedText;
		}
		
		// update view
		this.getInputElement().value  	= newValue;
		this.__cursorPosition			= 0;
		this.__previousLength			= 0;
		this.__handleKeyUpEvent(evt);
	}
};


// This function resets the prompt label using the current folder string
// supplied as an argument.  If no folder is provided, the root folder
// will be used.
App.Prompt.prototype.__setPromptLabel = function(folder) {
	this.getLabelElement().innerHTML = App.domainName + folder + " anonymous$";
};


// This function toggles the css properties of the cursor to give it the appearance 
// of blinking.
App.Prompt.prototype.__toggleCursor = function() {
    if (this.__isCursorVisible) {
		this.__isCursorVisible 				= false;
		this.getCursorElement().className 	= "off";
	}
	else {
		this.__isCursorVisible 				= true;
		this.getCursorElement().className 	= "on";
	}
};


// This function lazily instantiates a reference to the off-screen input field.
App.Prompt.prototype.getInputElement = function() {
	if (!this.__inputElement) {
		this.__inputElement = document.getElementById('terminal_prompt_offscreen');
	}
	return this.__inputElement;
};


// This function lazily instantiates a reference to the hidden input field.
App.Prompt.prototype.getHiddenElement = function() {
	if (!this.__hiddenElement) {
		this.__hiddenElement = document.getElementById('terminal_prompt_hidden');
	}
	return this.__hiddenElement;
};


// This function lazily instantiates a reference to the label element.
App.Prompt.prototype.getLabelElement = function() {
	if (!this.__labelElement) {
		this.__labelElement = document.getElementById('terminal_prompt_label');
	}
	return this.__labelElement;
};


// This function lazily instantiates a reference to the before cursor element.
App.Prompt.prototype.getBeforeElement = function() {
	if (!this.__beforeElement) {
		this.__beforeElement = document.getElementById('terminal_prompt_before');
	}
	return this.__beforeElement;
};


// This function lazily instantiates a reference to the cursor element.
App.Prompt.prototype.getCursorElement = function() {
	if (!this.__cursorElement) {
		this.__cursorElement = document.getElementById('terminal_prompt_cursor');
	}
	return this.__cursorElement;
};


// This function lazily instantiates a reference to the after cursor element.
App.Prompt.prototype.getAfterElement = function() {
	if (!this.__afterElement) {
		this.__afterElement = document.getElementById('terminal_prompt_after');
	}
	return this.__afterElement;
};


// This function handles blur events for the off-screen text field.  For now,
// all that happens is we mark the input element so that asynchronous functions
// can determine whether or not it has focus.
App.Prompt.prototype.onBlur = function(evt) {
	this.__hasFocus = false;
	if (this.__focusTimer) {
		clearInterval(this.__focusTimer);
	}
	
	if (!this.__isCursorVisible) {
		this.__toggleCursor();
	}
};


// This function transfers focus to the off-screen text field used to collect
// user input.  Also, to marks the input element so that asynchronous functions
// can determine whether or not it has focus.
App.Prompt.prototype.onFocus = function(evt) {
	
	// flip state
	this.__hasFocus = true;

	// if needed, clear timer to prevent memory leaks
	if (this.__focusTimer) {
		clearInterval(this.__focusTimer);
	}
	
	// build closure and set interval (we need to do this so the function
	// has the appropriate scope when the interval calls it.)
	var self = this;
	var fn = function() {
		self.__toggleCursor();
	}
	this.__focusTimer = setInterval(fn, 750);
};


// This function transfers values typed into the hidden text field to
// the display-only fields acting as the stdin.
App.Prompt.prototype.onKeyUp = function(evt) {
	
	// if arrow up or arrow down, send to command history handler; else, 
	// send to generic keyup handler
	if (evt.keyCode == Event.KEY_UP || evt.keyCode == Event.KEY_DOWN) {
		this.__loadCommandHistory(evt);
	}
	else {
		this.__handleKeyUpEvent(evt);
	}
};


// This function records the prompt value in the history.
App.Prompt.prototype.record = function(evt) {
	this.__history.add(this.getInputElement().value);
};


// This function clears the prompt fields and resets the basic variables.
App.Prompt.prototype.reset = function(folder) {
	this.__clear();
	this.__setPromptLabel(folder);
	this.setFocus();
};


// This function allows the document to request focus settings without
// getting the ui into a difficult state.
App.Prompt.prototype.setFocus = function(evt) {
    if (!this.__hasFocus) {
		this.getInputElement().focus();
	}
};




/*--------------------------------------------------------------------
  This object declares a class in which the prompt history can be
  maintained.
--------------------------------------------------------------------*/

// This is the prompt history class.
App.PromptHistory = function() {
	
	// data references
	this.__commands = [];
	
	// state references
	this.__position = App.PromptHistory.DEFAULT_POSITION;
};


// These attributes are class-level properties.
App.PromptHistory.DEFAULT_POSITION	= -1
App.PromptHistory.MAX_SIZE 			= 100;


// This function allows a command to be added to the command array.
App.PromptHistory.prototype.add = function(cmd) {
	
	// silent failure if no command
	if (cmd) {
		
		// only adjust array if this command is the first command or if this 
		// command is different from the last command
		if (!this.__commands.length || cmd != this.__commands[this.__commands.length - 1]) {

			// add command to array
			this.__commands.push(cmd);
		
			// truncate array to maximum size
			while (this.__commands.length > App.PromptHistory.MAX_SIZE) {
				var temp = cmds.shift();
			}
		}
		
		// reset position
		this.__position = App.PromptHistory.DEFAULT_POSITION;
	}
};


// This function returns the command immediately preceding the current
// history position. If the request would take the array out of bounds,
// the function returns null.
App.PromptHistory.prototype.getPrevious = function() {
	
	// if current position 0 or no commands, return null (ie, do nothing)
	if (this.__position == 0 || !this.__commands.length) {
		return null;
	}
	
	// else, set new position and return command at that index
	else {
		if (this.isDefaultPosition()) {
			this.__position = this.__commands.length - 1;
		}
		else {
			this.__position--;
		}
		return this.__commands[this.__position];
	}
};


// This function returns the command immediately following the current
// history position. If the request would take the array out of bounds,
// the function returns null.
App.PromptHistory.prototype.getNext = function() {
	
	// if already in default position, return null
	if (this.isDefaultPosition()) {
		return null;
	}
	
	// increment the position
	this.__position++;
	
	// if new position equals length, reset to default and return empty string
	if (this.__position == this.__commands.length) {
		this.__position = App.PromptHistory.DEFAULT_POSITION;
		return "";
	}
	
	// else return command at position index
	else {
		return this.__commands[this.__position];
	}
};


// This function allows the parent object to determine whether or not the 
// history object is in the default position.
App.PromptHistory.prototype.isDefaultPosition = function() {
	return (this.__position == App.PromptHistory.DEFAULT_POSITION)
}