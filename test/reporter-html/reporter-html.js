// The following tests need to run on their respective order
QUnit.config.reorder = false;

QUnit.module( "<script id='qunit-unescaped-module'>'module';</script>", {
	beforeEach: function() {
	},
	afterEach: function( assert ) {

		// We can't use ok(false) inside script tags since some browsers
		// don't evaluate script tags inserted through innerHTML after domready.
		// Counting them before/after doesn't cover everything either as qunit-modulefilter
		// is created before any test is ran. So use ids instead.
		if ( document.getElementById( "qunit-unescaped-module" ) ) {

			// This can either be from in #qunit-modulefilter or #qunit-testresult
			assert.ok( false, "Unescaped module name" );
		}
		if ( document.getElementById( "qunit-unescaped-test" ) ) {
			assert.ok( false, "Unescaped test name" );
		}
		if ( document.getElementById( "qunit-unescaped-assertion" ) ) {
			assert.ok( false, "Unescaped test name" );
		}
	}
} );

QUnit.test( "<script id='qunit-unescaped-test'>'test';</script>", function( assert ) {
	assert.expect( 1 );
	assert.ok( true, "<script id='qunit-unescaped-asassertionsert'>'assertion';</script>" );
} );

QUnit.module( "display test info", {
	getPreviousTest: function( assert ) {
		return document.getElementById( "qunit-test-output-" + assert.test.testId  )
			.previousSibling;
	}
} );

QUnit.test( "running test name displayed", function( assert ) {
	assert.expect( 2 );

	var displaying = document.getElementById( "qunit-testresult" );

	assert.ok( /running test name displayed/.test( displaying.innerHTML ),
		"Expect test name to be found in displayed text"
	);
	assert.ok( /display test info/.test( displaying.innerHTML ),
		"Expect module name to be found in displayed text"
	);
} );

QUnit.test( "previous test displays filtering run options", function( assert ) {
	assert.expect( 1 );

	var previous = this.getPreviousTest( assert ),
		filteringLinks = previous.getElementsByTagName( "a" );

	assert.strictEqual( filteringLinks[ 0 ].innerHTML, "Rerun", "'Rerun' link displayed" );
} );

QUnit.module( "timing", {
	getPreviousTest: function( assert ) {
		return document.getElementById( "qunit-test-output-" + assert.test.testId  )
			.previousSibling;
	},
	filterClass: function( elements ) {
		var i;
		for ( i = 0; i < elements.length; i++ ) {
			if ( /(^| )runtime( |$)/.test( elements[ i ].className ) ) {
				return elements[ i ];
			}
		}
	},
	afterEach: function( assert ) {
		var done;
		if ( this.delayNextSetup ) {
			this.delayNextSetup = false;
			done = assert.async();
			setTimeout( function() {
				done();
			}, 101 );
		}
	}
} );

QUnit.test( "setup", function( assert ) {
	assert.expect( 0 );
	this.delayNextSetup = true;
} );

QUnit.test( "basics", function( assert ) {
	assert.expect( 1 );
	var previous = this.getPreviousTest( assert ),
		runtime = this.filterClass( previous.getElementsByTagName( "span" ) );

	assert.ok( /^\d+ ms$/.test( runtime.innerHTML ), "Runtime reported in ms" );
} );

QUnit.test( "values", function( assert ) {
	assert.expect( 2 );

	var basics = this.getPreviousTest( assert ),
		setup = basics.previousSibling;

	basics = this.filterClass( basics.getElementsByTagName( "span" ) );
	setup = this.filterClass( setup.getElementsByTagName( "span" ) );

	assert.ok( parseInt( basics.innerHTML, 10 ) < 100,
		"Fast runtime for trivial test"
	);
	assert.ok( parseInt( setup.innerHTML, 10 ) > 100,
		"Runtime includes beforeEach"
	);
} );

QUnit.module( "source" );

QUnit.test( "setup", function( assert ) {
	assert.expect( 0 );
} );

QUnit.test( "logs location", function( assert ) {
	var previous = document.getElementById( "qunit-test-output-" + assert.test.testId  )
		.previousSibling;
	var source = previous.lastChild;
	var stack = QUnit.stack();

	// Verify QUnit supported stack trace
	if ( !stack ) {
		assert.equal(
			/(^| )qunit-source( |$)/.test( source.className ),
			false,
			"Don't add source information on unsupported environments"
		);
		return;
	}

	assert.ok( /(^| )qunit-source( |$)/.test( source.className ), "Source element exists" );
	assert.equal( source.firstChild.innerHTML, "Source: " );

	// The file test/reporter-html/reporter-html.js is a direct reference to this test file
	assert.ok( /\/test\/reporter-html\/reporter-html\.js\:\d+/.test( source.innerHTML ),
		"Source references to the current file and line number"
	);
} );

QUnit.module( "module list item", {
	getPreviousModule: function( assert ) {
		var element  = document.getElementById(
			"qunit-module-output-" + assert.test.module.moduleId
		).previousSibling;

		while ( element && element.id.indexOf( "qunit-module-output-" ) !== 0 ) {
			element = element.previousSibling;
		}

		return element;
	}
}, function() {
	QUnit.module( "running state", function() {
		QUnit.test( "is running when first test runs", function( assert ) {
			var moduleItem = document.getElementById(
				"qunit-module-output-" + assert.test.module.moduleId
			);

			assert.strictEqual( moduleItem.className, "module-running",
				"Module marked as running" );
		} );
	} );

	QUnit.module( "passed state", function() {
		QUnit.test( "is passed after all tests passed", function( assert ) {
			var moduleItem = this.getPreviousModule( assert );

			assert.strictEqual( moduleItem.className, "module-pass",
				"Module marked as pass" );
		} );
	} );

	QUnit.module( "Module with a skipped test", function() {
		QUnit.skip( "A skipped test", function() { } );
	} );

	QUnit.module( "skipped state", function() {
		QUnit.test( "is skipped after skipping a test", function( assert ) {
			var moduleItem = this.getPreviousModule( assert );

			assert.strictEqual( moduleItem.className, "module-skipped",
				"Module marked as skipped" );
		} );
	} );

	QUnit.test( "contains link to run module", function( assert ) {
		var moduleItem = document.getElementById(
			"qunit-module-output-" + assert.test.module.moduleId
		),
			link = moduleItem.getElementsByTagName( "a" );

		assert.strictEqual( link[ 0 ].innerHTML, "Run module",
			"'Run module' link displayed"
		);
	} );
} );

