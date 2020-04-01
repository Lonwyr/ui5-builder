const test = require("ava");
const flexAPI = require("../../../lib/tools/flexAPI");

function clone(object, propertiesToRemove) {
	const clonedObject = Object.assign({}, object);
	propertiesToRemove.forEach(function (property) {
		delete clonedObject[property];
	});

	return clonedObject;
}

const manifest = {
	"sap.app": {
		id: "test.app",
		applicationVersion: {
			version: "1.0.0"
		}
	}
};

const manifestFioriElementsBased = {
	"sap.app": {
		id: "test.app",
		applicationVersion: {
			version: "1.0.0"
		},
		sourceTemplate: {
			id: "ui5template.smartTemplate"
		}
	}
};

const completeChange = {
	id: "id_123_0_propertyChange",
	reference: "test.app",
	appVersion: "1.0.0",
	creation: 1585730948833,
	type: "propertyChange",
	controlId: "myTable",
	isCustomer: true,
	creatingTool: "ava test",
	content: {
		"property": "exportToExcel",
		"newValue": true
	}
};


const changeInCreation = clone(completeChange, ["id", "reference", "appVersion"]);

test("flexAPI parses", (t) => {
	const change = flexAPI.change.parse("{\"fileName\":\"id_1585730948833_0_propertyChange\",\"fileType\":\"change\",\"changeType\":\"propertyChange\",\"moduleName\":\"\",\"reference\":\"test.app\",\"packageName\":\"\",\"content\":{\"property\":\"exportToExcel\",\"newValue\":true},\"selector\":{\"id\":\"myTable\",\"idIsLocal\":true},\"layer\":\"CUSTOMER_BASE\",\"texts\":{},\"namespace\":\"apps/test.app/changes/\",\"projectId\":\"test.app\",\"creation\":1585730948833,\"originalLanguage\":\"\",\"support\":{\"sapui5Version\": \"1.77.0\",\"generator\":\"flexAPI: ava test\",\"service\":\"\",\"user\":\"\",\"sourceChangeFileName\":\"\",\"compositeCommand\":\"\"},\"oDataInformation\":{},\"dependentSelector\":{},\"validAppVersions\":{\"from\":\"1.0.0\",\"to\":\"1.0.0\",\"creation\":\"1.0.0\"},\"jsOnly\":false,\"variantReference\":\"\",\"appDescriptorChange\":false}");
	t.deepEqual(change, {
		id: "id_1585730948833_0_propertyChange",
		type: "propertyChange",
		reference: "test.app",
		appVersion: "1.0.0",
		controlId: "myTable",
		isCustomer: true,
		creatingTool: "ava test",
		creation: 1585730948833,
		sapui5Version: "1.77.0",
		projectId: "test.app",
		content: {
			"property": "exportToExcel",
			"newValue": true
		}
	}, "The change object should be parsed correct");
});

function testToString(t, propertiesToRemove = []) {
	const testChange = clone(changeInCreation, propertiesToRemove);
	const error = t.throws(flexAPI.change.toString.bind(undefined, testChange, manifest));
	t.is(error.message, "not all parameters of the change were provided");
}

test("flexAPI toString throws an error: no manifest and no reference/appVersion", (t) => {
	const error = t.throws(flexAPI.change.toString.bind(undefined, changeInCreation));
	t.is(error.message, "not all parameters of the change were provided");
});

test("flexAPI toString throws an error: no type", (t) => {
	testToString(t, ["type"], manifest);
});

test("flexAPI toString throws an error: no controlId", (t) => {
	testToString(t, ["controlId"], manifest);
});

test("flexAPI toString throws an error: no isCustomer", (t) => {
	testToString(t, ["isCustomer"], manifest);
});

test("flexAPI toString throws an error: no creatingTool", (t) => {
	testToString(t, ["creatingTool"], manifest);
});

test("flexAPI toString create a change (manifest is provided)", (t) => {
	let stringifiedChange = flexAPI.change.toString(changeInCreation, manifest);

	// replace uid & creation time
	stringifiedChange = stringifiedChange.replace(
		/"fileName":"id_.*_.*_propertyChange"/,
		"\"fileName\":\"id_123_0_propertyChange\""
	);
	stringifiedChange = stringifiedChange.replace(/"creation":[0-9]*/, "\"creation\":0");
	t.deepEqual(stringifiedChange, "{\"fileName\":\"id_123_0_propertyChange\",\"fileType\":\"change\",\"changeType\":\"propertyChange\",\"moduleName\":\"\",\"reference\":\"test.app\",\"packageName\":\"\",\"content\":{\"property\":\"exportToExcel\",\"newValue\":true},\"selector\":{\"id\":\"myTable\",\"idIsLocal\":true},\"layer\":\"CUSTOMER_BASE\",\"texts\":{},\"namespace\":\"apps/test.app/changes/\",\"projectId\":\"\",\"creation\":0,\"originalLanguage\":\"\",\"support\":{\"generator\":\"flexAPI: ava test\",\"service\":\"\",\"user\":\"\",\"sourceChangeFileName\":\"\",\"compositeCommand\":\"\"},\"oDataInformation\":{},\"dependentSelector\":{},\"validAppVersions\":{\"from\":\"1.0.0\",\"to\":\"1.0.0\",\"creation\":\"1.0.0\"},\"jsOnly\":false,\"variantReference\":\"\",\"appDescriptorChange\":false}", "The result should be an empty string");
});

test("flexAPI toString create a change (manifest is provided based on fiori elements)", (t) => {
	let stringifiedChange = flexAPI.change.toString(changeInCreation, manifestFioriElementsBased);

	// replace uid & creation time
	stringifiedChange = stringifiedChange.replace(
		/"fileName":"id_.*_.*_propertyChange"/,
		"\"fileName\":\"id_123_0_propertyChange\""
	);
	stringifiedChange = stringifiedChange.replace(/"creation":[0-9]*/, "\"creation\":0");
	t.deepEqual(stringifiedChange, "{\"fileName\":\"id_123_0_propertyChange\",\"fileType\":\"change\",\"changeType\":\"propertyChange\",\"moduleName\":\"\",\"reference\":\"test.app\",\"packageName\":\"\",\"content\":{\"property\":\"exportToExcel\",\"newValue\":true},\"selector\":{\"id\":\"myTable\",\"idIsLocal\":true},\"layer\":\"CUSTOMER_BASE\",\"texts\":{},\"namespace\":\"apps/test.app/changes/\",\"projectId\":\"test.app\",\"creation\":0,\"originalLanguage\":\"\",\"support\":{\"generator\":\"flexAPI: ava test\",\"service\":\"\",\"user\":\"\",\"sourceChangeFileName\":\"\",\"compositeCommand\":\"\"},\"oDataInformation\":{},\"dependentSelector\":{},\"validAppVersions\":{\"from\":\"1.0.0\",\"to\":\"1.0.0\",\"creation\":\"1.0.0\"},\"jsOnly\":false,\"variantReference\":\"\",\"appDescriptorChange\":false}", "The result should be an empty string");
});

test("flexAPI toString strigifies a change again (id, reference, appVersion provided; manifest not provided)", (t) => {
	const stringifiedChange = flexAPI.change.toString(completeChange);
	t.deepEqual(stringifiedChange, "{\"fileName\":\"id_123_0_propertyChange\",\"fileType\":\"change\",\"changeType\":\"propertyChange\",\"moduleName\":\"\",\"reference\":\"test.app\",\"packageName\":\"\",\"content\":{\"property\":\"exportToExcel\",\"newValue\":true},\"selector\":{\"id\":\"myTable\",\"idIsLocal\":true},\"layer\":\"CUSTOMER_BASE\",\"texts\":{},\"namespace\":\"apps/test.app/changes/\",\"projectId\":\"\",\"creation\":1585730948833,\"originalLanguage\":\"\",\"support\":{\"generator\":\"flexAPI: ava test\",\"service\":\"\",\"user\":\"\",\"sourceChangeFileName\":\"\",\"compositeCommand\":\"\"},\"oDataInformation\":{},\"dependentSelector\":{},\"validAppVersions\":{\"from\":\"1.0.0\",\"to\":\"1.0.0\",\"creation\":\"1.0.0\"},\"jsOnly\":false,\"variantReference\":\"\",\"appDescriptorChange\":false}", "The result should be an empty string");
});
