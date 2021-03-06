/**
 * fullscreenForm.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
;( function( window ) {

	'use strict';

	var support = { animations : Modernizr.cssanimations },
		animEndEventNames = { 'WebkitAnimation' : 'webkitAnimationEnd', 'OAnimation' : 'oAnimationEnd', 'msAnimation' : 'MSAnimationEnd', 'animation' : 'animationend' },
		// animation end event name
		animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ];

	/**
	 * extend obj function
	 */
	function extend( a, b ) {
		for( var key in b ) {
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	/**
	 * createElement function
	 * creates an element with tag = tag, className = opt.cName, innerHTML = opt.inner and appends it to opt.appendTo
	 */
	function createElement( tag, opt ) {
		var el = document.createElement( tag )
		if( opt ) {
			if( opt.cName ) {
				el.className = opt.cName;
			}
			if( opt.inner ) {
				el.innerHTML = opt.inner;
			}
			if( opt.appendTo ) {
				opt.appendTo.appendChild( el );
			}
		}
		return el;
	}

	/**
	 * FForm function
	 */
	function FForm( el, options ) {
		this.el = el;
		this.options = extend( {}, this.options );
  		extend( this.options, options );
  		this._init();
	}

	/**
	 * FForm options
	 */
	FForm.prototype.options = {
		// show progress bar
		ctrlProgress : false,
		// show navigation dots
		ctrlNavDots : true,
		// show [current field]/[total fields] status
		ctrlNavPosition : false,
		// reached the review and submit step
		onReview : function() { return false; }
	};

	/**
	 * init function
	 * initialize and cache some vars
	 */
	FForm.prototype._init = function() {
		// the form element
		this.formEl = this.el.querySelector( 'form' );

		// list of fields
		this.fieldsList = this.formEl.querySelector( 'ol.fs-fields' );

		// current field position
		this.current = 0;

		// all fields
		this.fields = [].slice.call( this.fieldsList.children );

		// total fields
		this.fieldsCount = this.fields.length;

    this.textos = {
      "limpieza" : [
        { text: "Limpieza del coche", type: "emotion" },
        { text: "Aspecto del conductor", type: "emotion" },
        { text: "Estado del vehículo", type: "emotion" },
        { text: "Ambiente (olores,volumen de la radio,climatización...)", type: "emotion" }
      ],
      "trato" : [
        { text: "Predisposición para ayudar por parte del taxista",type: "emotion" },
        { text: "¿Su taxista le transmite confianza?",type: "yesno" },
        { text: "¿Ha sido amable?",type: "yesno" },
        { text: "Conversación", type: "emotion" }
      ],
      "seguridad" : [
        { text: "¿La conducción ha sido adecuada?", type: "yesno"},
        { text: "¿Ha notado ud. exceso de velocidad en el trayecto?",type: "yesno"},
        { text: "¿Ha respetado su taxista las normas de tráfico?",type: "yesno"},
        { text: "Atención por los ciclistas/peatones", type: "yesno"}
      ],
      "informacion" : [
        { text: "¿Considera que la ruta ha sido la adecuada?",type: "emotion"},
        { text: "¿Conoce ud. las tarifas del servicio?",type: "yesno"},
        { text: "¿Conoce ud. sus derechos como cliente?",type: "yesno"},
        { text: "¿Ha recibido ud. la información de forma transparente?",type: "emotion"}
      ]
    }

    this.questions = {
      "limpieza"      : this.textos.limpieza.map((obj, i) => this._question2html(obj.text, i + 3, obj.type)),
      "trato"         : this.textos.trato.map((obj, i) => this._question2html(obj.text, i + 3,obj.type)),
      "seguridad"     : this.textos.seguridad.map((obj, i) => this._question2html(obj.text, i + 3,obj.type)),
      "informacion" : this.textos["informacion"].map((obj, i) => this._question2html(obj.text, i + 3,obj.type)),
      "endQuestions"  : `<li data-input-trigger data-question="7">
       					<label class="fs-field-label fs-anim-upper" data-info="We'll make sure to use it all over">¿Recibió ticket?</label>
       					<div class="fs-radio-group fs-radio-custom clearfix fs-anim-lower">
       						<span><input id="q7a" name="q7" type="radio" value="ticket_yes" required/><label for="q7a" class="radio-yes">Sí</label></span>
       						<span><input id="q7b" name="q7" type="radio" value="ticket_no" required/><label for="q7b" class="radio-no">No</label></span>
       					</div>
       				</li>
              <li data-input-trigger data-question="8">
                <label class="fs-field-label fs-anim-upper" for="q8">Si quiere dejar algún comentario, puede hacerlo aquí:</label>
                <textarea class="fs-anim-lower" id="q8" name="q8" placeholder="Describe here"></textarea>
              </li>`
    };

		// show first field
		classie.add( this.fields[ this.current ], 'fs-current' );

		// create/add controls
		this._addControls();

		// create/add messages
		this._addErrorMsg();

		// init events
		this._initEvents();
	};

  FForm.prototype._question2html = function(text, qNumber,questionType) {
    let yesno_template = `<span><input id="q${qNumber}a" name="q${qNumber}" type="radio" value="limpieza" required/><label for="q${qNumber}a" class="radio-yes">Sí</label></span>
      <span><input id="q${qNumber}b" name="q${qNumber}" type="radio" value="trato" required/><label for="q${qNumber}b" class="radio-no">No</label></span>`;

    let emotion_template = `<span><input id="q${qNumber}a" name="q${qNumber}" type="radio" value="limpieza" required /><label for="q${qNumber}a" class="radio-happy">Muy bien</label></span>
    <span><input id="q${qNumber}b" name="q${qNumber}" type="radio" value="trato" required /><label for="q${qNumber}b" class="radio-shocked">Bien</label></span>
    <span><input id="q${qNumber}c" name="q${qNumber}" type="radio" value="seguridad" required /><label for="q${qNumber}c" class="radio-sad">Mejorable</label></span>
    <span><input id="q${qNumber}d" name="q${qNumber}" type="radio" value="transparencia" required /><label for="q${qNumber}d" class="radio-angry">Muy Mal</label></span>`;

    return `<li data-input-trigger data-question="${qNumber}">
    					<label class="fs-field-label fs-anim-upper" for="q3" data-info="">${text}</label>
    					<div class="fs-radio-group fs-radio-custom clearfix fs-anim-lower">
    						${questionType === "yesno" ? `${yesno_template}` : `${emotion_template}` }
    					</div>
    				</li>`;
  }

	/**
	 * addControls function
	 * create and insert the structure for the controls
	 */
	FForm.prototype._addControls = function() {
		// main controls wrapper
		this.ctrls = createElement( 'div', { cName : 'fs-controls', appendTo : this.el } );

		// continue button (jump to next field)
		this.ctrlContinue = createElement( 'button', { cName : 'fs-continue', inner : 'Continue', appendTo : this.ctrls } );
		this._showCtrl( this.ctrlContinue );

		// navigation dots
		if( this.options.ctrlNavDots ) {
			this.ctrlNav = createElement( 'nav', { cName : 'fs-nav-dots', appendTo : this.ctrls } );
			var dots = '';
			for( var i = 0; i < this.fieldsCount; ++i ) {
				dots += i === this.current ? '<button class="fs-dot-current"></button>' : '<button disabled></button>';
			}
			this.ctrlNav.innerHTML = dots;
			this._showCtrl( this.ctrlNav );
			this.ctrlNavDots = [].slice.call( this.ctrlNav.children );
		}

		// field number status
		if( this.options.ctrlNavPosition ) {
			this.ctrlFldStatus = createElement( 'span', { cName : 'fs-numbers', appendTo : this.ctrls } );

			// current field placeholder
			this.ctrlFldStatusCurr = createElement( 'span', { cName : 'fs-number-current', inner : Number( this.current + 1 ) } );
			this.ctrlFldStatus.appendChild( this.ctrlFldStatusCurr );

			// total fields placeholder
			this.ctrlFldStatusTotal = createElement( 'span', { cName : 'fs-number-total', inner : this.fieldsCount } );
			this.ctrlFldStatus.appendChild( this.ctrlFldStatusTotal );
			this._showCtrl( this.ctrlFldStatus );
		}

		// progress bar
		if( this.options.ctrlProgress ) {
			this.ctrlProgress = createElement( 'div', { cName : 'fs-progress', appendTo : this.ctrls } );
			this._showCtrl( this.ctrlProgress );
		}
	}

	/**
	 * addErrorMsg function
	 * create and insert the structure for the error message
	 */
	FForm.prototype._addErrorMsg = function() {
		// error message
		this.msgError = createElement( 'span', { cName : 'fs-message-error', appendTo : this.el } );
	}

  FForm.prototype._updateFields = function(str) {

    this.fieldsList.insertAdjacentHTML('beforeend', str);
    // all fields
		this.fields = [].slice.call( this.fieldsList.children );

		// total fields
		this.fieldsCount = this.fields.length;
    this._initEvents();
  }

  FForm.prototype._updateForm = function (sel) {
    var questionsToLoad = [];
    var self = this;
    switch(`${sel.unanswered.length}`) {
      case "1" :
          sel.unanswered.map(q => questionsToLoad.push(this.textos[q].map((obj, i) => this._question2html(obj.text, i + 3, obj.type)).join("")));
          break;
      case "2" :
          sel.unanswered.map(q => questionsToLoad.push(this.textos[q].map((obj, i) => this._question2html(obj.text, i < 2 ? i + 3 : i + 5, obj.type)).slice(0,2).join("")));
          break;
      case "3" :
          sel.unanswered.map(q => q === "limpieza"
            ? questionsToLoad.push(this.textos[q].map((obj, i) => this._question2html(obj.text, i + 3, obj.type)).slice(0,2).join(""))
            : questionsToLoad.push(this.textos[q].map((obj, i) => this._question2html(obj.text, i + 3, obj.type))[0]));
          break;
    };

    let htmlQuestions = questionsToLoad.join("").concat(self.questions["endQuestions"]);
    self._updateFields(htmlQuestions);

    // questionsToLoad.map(function(htmlStr){
    //   self._updateFields(htmlStr);
    // });
  }


  FForm.prototype._nextQuestions = function() {
    let current = this.fields.filter(el => [...el.classList].includes("fs-current"))[0];
    let list = [...current.querySelectorAll('input')];
    let selection = {
      questionNumber : current.dataset.question,
      unanswered: list.map(el => !el.checked ? el : null).filter(el => el).map(el => el.value),
      options: list.length
    };
    if (selection.questionNumber == 2){
      this._updateForm(selection);
    }
  }

	/**
	 * init events
	 */
	FForm.prototype._initEvents = function() {
		var self = this;

		// show next field
		this.ctrlContinue.addEventListener( 'click', function(ev) {
      self._nextQuestions();
      self._nextField();
		} );

		// navigation dots
		if( this.options.ctrlNavDots ) {
			this.ctrlNavDots.forEach( function( dot, pos ) {
				dot.addEventListener( 'click', function() {
					self._showField( pos );
				} );
			} );
		}

		// jump to next field without clicking the continue button (for fields/list items with the attribute "data-input-trigger")
		this.fields.forEach( function( fld ) {
			if( fld.hasAttribute( 'data-input-trigger' ) ) {
				var input = fld.querySelector( 'input[type="radio"]' ) || /*fld.querySelector( '.cs-select' ) ||*/ fld.querySelector( 'select' ); // assuming only radio and select elements (TODO: exclude multiple selects)
				if( !input ) return;

				switch( input.tagName.toLowerCase() ) {
					case 'select' :
						input.addEventListener( 'change', function(ev) {
              self._nextQuestions();
              self._nextField();
            } );
						break;

					case 'input' :
						[].slice.call( fld.querySelectorAll( 'input[type="radio"]' ) ).forEach( function( inp ) {
							inp.addEventListener( 'change', function(ev) {
                self._nextQuestions();
                self._nextField();
              } );
						} );
						break;

					/*
					// for our custom select we would do something like:
					case 'div' :
						[].slice.call( fld.querySelectorAll( 'ul > li' ) ).forEach( function( inp ) {
							inp.addEventListener( 'click', function(ev) { self._nextField(); } );
						} );
						break;
					*/
				}
			}
		} );

		// keyboard navigation events - jump to next field when pressing enter
		document.addEventListener( 'keydown', function( ev ) {
			if( !self.isLastStep && ev.target.tagName.toLowerCase() !== 'textarea' ) {
				var keyCode = ev.keyCode || ev.which;
				if( keyCode === 13 ) {
					ev.preventDefault();
					self._nextField();
				}
			}
		} );
	};

	/**
	 * nextField function
	 * jumps to the next field
	 */
	FForm.prototype._nextField = function( backto ) {
		//if( this.isLastStep || !this._validade() || this.isAnimating ) {
    if( this.isLastStep ||  !this._validade() || this.isAnimating ) {
			return false;
		}
		this.isAnimating = true;

		// check if on last step
		this.isLastStep = this.current === this.fieldsCount - 1 && backto === undefined ? true : false;

		// clear any previous error messages
		this._clearError();

		// current field
		var currentFld = this.fields[ this.current ];

		// save the navigation direction
		this.navdir = backto !== undefined ? backto < this.current ? 'prev' : 'next' : 'next';

		// update current field
		this.current = backto !== undefined ? backto : this.current + 1;

		if( backto === undefined ) {
			// update progress bar (unless we navigate backwards)
			this._progress();

			// save farthest position so far
			this.farthest = this.current;
		}

		// add class "fs-display-next" or "fs-display-prev" to the list of fields
		classie.add( this.fieldsList, 'fs-display-' + this.navdir );

		// remove class "fs-current" from current field and add it to the next one
		// also add class "fs-show" to the next field and the class "fs-hide" to the current one
		classie.remove( currentFld, 'fs-current' );
		classie.add( currentFld, 'fs-hide' );

		if( !this.isLastStep ) {
			// update nav
			this._updateNav();

			// change the current field number/status
			this._updateFieldNumber();

			var nextField = this.fields[ this.current ];
			classie.add( nextField, 'fs-current' );
			classie.add( nextField, 'fs-show' );
		}

		// after animation ends remove added classes from fields
		var self = this,
			onEndAnimationFn = function( ev ) {
				if( support.animations ) {
					this.removeEventListener( animEndEventName, onEndAnimationFn );
				}

				classie.remove( self.fieldsList, 'fs-display-' + self.navdir );
				classie.remove( currentFld, 'fs-hide' );

				if( self.isLastStep ) {
					// show the complete form and hide the controls
					self._hideCtrl( self.ctrlNav );
					self._hideCtrl( self.ctrlProgress );
					self._hideCtrl( self.ctrlContinue );
					self._hideCtrl( self.ctrlFldStatus );
					// replace class fs-form-full with fs-form-overview
					classie.remove( self.formEl, 'fs-form-full' );
					classie.add( self.formEl, 'fs-form-overview' );
					classie.add( self.formEl, 'fs-show' );
					// callback
					self.options.onReview();
				}
				else {
					classie.remove( nextField, 'fs-show' );

					if( self.options.ctrlNavPosition ) {
						self.ctrlFldStatusCurr.innerHTML = self.ctrlFldStatusNew.innerHTML;
						self.ctrlFldStatus.removeChild( self.ctrlFldStatusNew );
						classie.remove( self.ctrlFldStatus, 'fs-show-' + self.navdir );
					}
				}
				self.isAnimating = false;
			};

		if( support.animations ) {
			if( this.navdir === 'next' ) {
				if( this.isLastStep ) {
					currentFld.querySelector( '.fs-anim-upper' ).addEventListener( animEndEventName, onEndAnimationFn );
				}
				else {
					nextField.querySelector( '.fs-anim-lower' ).addEventListener( animEndEventName, onEndAnimationFn );
				}
			}
			else {
				nextField.querySelector( '.fs-anim-upper' ).addEventListener( animEndEventName, onEndAnimationFn );
			}
		}
		else {
			onEndAnimationFn();
		}
	}

	/**
	 * showField function
	 * jumps to the field at position pos
	 */
	FForm.prototype._showField = function( pos ) {
		if( pos === this.current || pos < 0 || pos > this.fieldsCount - 1 ) {
			return false;
		}
		this._nextField( pos );
	}

	/**
	 * updateFieldNumber function
	 * changes the current field number
	 */
	FForm.prototype._updateFieldNumber = function() {
		if( this.options.ctrlNavPosition ) {
			// first, create next field number placeholder
			this.ctrlFldStatusNew = document.createElement( 'span' );
			this.ctrlFldStatusNew.className = 'fs-number-new';
			this.ctrlFldStatusNew.innerHTML = Number( this.current + 1 );

			// insert it in the DOM
			this.ctrlFldStatus.appendChild( this.ctrlFldStatusNew );

			// add class "fs-show-next" or "fs-show-prev" depending on the navigation direction
			var self = this;
			setTimeout( function() {
				classie.add( self.ctrlFldStatus, self.navdir === 'next' ? 'fs-show-next' : 'fs-show-prev' );
			}, 25 );
		}
	}

	/**
	 * progress function
	 * updates the progress bar by setting its width
	 */
	FForm.prototype._progress = function() {
		if( this.options.ctrlProgress ) {
			this.ctrlProgress.style.width = this.current * ( 100 / this.fieldsCount ) + '%';
		}
	}

	/**
	 * updateNav function
	 * updates the navigation dots
	 */
	FForm.prototype._updateNav = function() {
		if( this.options.ctrlNavDots ) {
			classie.remove( this.ctrlNav.querySelector( 'button.fs-dot-current' ), 'fs-dot-current' );
			classie.add( this.ctrlNavDots[ this.current ], 'fs-dot-current' );
			this.ctrlNavDots[ this.current ].disabled = false;
		}
	}

	/**
	 * showCtrl function
	 * shows a control
	 */
	FForm.prototype._showCtrl = function( ctrl ) {
		classie.add( ctrl, 'fs-show' );
	}

	/**
	 * hideCtrl function
	 * hides a control
	 */
	FForm.prototype._hideCtrl = function( ctrl ) {
		classie.remove( ctrl, 'fs-show' );
	}

	// TODO: this is a very basic validation function. Only checks for required fields..
	FForm.prototype._validade = function() {
		var fld = this.fields[ this.current ],
			input = fld.querySelector( 'input[required]' ) || fld.querySelector( 'textarea[required]' ) || fld.querySelector( 'select[required]' ),
			error;

		if( !input ) return true;

		switch( input.tagName.toLowerCase() ) {
			case 'input' :
				if( input.type === 'radio' || input.type === 'checkbox' ) {
					var checked = 0;
					[].slice.call( fld.querySelectorAll( 'input[type="' + input.type + '"]' ) ).forEach( function( inp ) {
						if( inp.checked ) {
							++checked;
						}
					} );
					if( !checked ) {
						error = 'NOVAL';
					}
				}
				else if( input.value === '' ) {
					error = 'NOVAL';
				}
				break;

			case 'select' :
				// assuming here '' or '-1' only
				if( input.value === '' || input.value === '-1' ) {
					error = 'NOVAL';
				}
				break;

			case 'textarea' :
				if( input.value === '' ) {
					error = 'NOVAL';
				}
				break;
		}

		if( error != undefined ) {
			this._showError( error );
			return false;
		}

		return true;
	}

	// TODO
	FForm.prototype._showError = function( err ) {
		var message = '';
		switch( err ) {
			case 'NOVAL' :
				message = 'Por favor, escoge una opción';
				break;
		};
		this.msgError.innerHTML = message;
		this._showCtrl( this.msgError );
	}

	// clears/hides the current error message
	FForm.prototype._clearError = function() {
		this._hideCtrl( this.msgError );
	}

	// add to global namespace
	window.FForm = FForm;

})( window );
