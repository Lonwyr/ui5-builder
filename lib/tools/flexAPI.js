let iIdCounter = 0;
const FLEX_API_PREFIX = "flexAPI: ";

function uid() {
	return "id-" + new Date().valueOf() + "-" + iIdCounter++;
}

function appendComponentToReference(sComponentName) {
	if (sComponentName && sComponentName.indexOf(".Component") < 0) {
		sComponentName += ".Component";
	}
	return sComponentName;
}

function getFlexReference(manifest) {
	const oSapUi5Entry = manifest["sap.ui5"];
	if (oSapUi5Entry) {
		if (oSapUi5Entry.appVariantId) {
			return oSapUi5Entry.appVariantId;
		}

		if (oSapUi5Entry.componentName) {
			return appendComponentToReference(oSapUi5Entry.componentName);
		}
	}

	const sapApp = manifest["sap.app"];
	if (!sapApp || !sapApp.id) {
		throw Error("app ID could not be determined");
	}
	return sapApp.id;
}

function getAppVersion(manifest) {
	const sapApp = manifest["sap.app"];
	if (!sapApp || !sapApp.applicationVersion || !sapApp.applicationVersion.version) {
		throw Error("app version could not be determined");
	}
	return sapApp.applicationVersion.version;
}

function getProjectId(manifest, reference) {
	if (
		manifest &&
		manifest["sap.app"] &&
		manifest["sap.app"].sourceTemplate &&
		manifest["sap.app"].sourceTemplate.id === "ui5template.smartTemplate"
	) {
		return reference;
	}

	return "";
}


module.exports = {
	change: {
		parse: function(changeString) {
			const change = JSON.parse(changeString);

			if (
				!change.fileName ||
				!change.changeType ||
				!change.selector ||
				!change.selector.id ||
				!change.reference ||
				!change.validAppVersions ||
				!change.validAppVersions.creation ||
				!change.content ||
				!change.layer ||
				!change.projectId ||
				!change.support ||
				!change.support.sapui5Version ||
				!change.support.generator ||
				!change.creation
			) {
				throw Error("parsed object contains not all required parameters");
			}

			return {
				id: change.fileName,
				type: change.changeType,
				controlId: change.selector.id,
				reference: change.reference,
				appVersion: change.validAppVersions.creation,
				content: change.content,
				isCustomer: change.layer === "CUSTOMER_BASE",
				projectId: change.projectId,
				sapui5Version: change.support.sapui5Version,
				creatingTool: change.support.generator.replace(FLEX_API_PREFIX, ""),
				creation: change.creation
			};
		},
		/**
		 *
		 * @param {Object}  propertyBag - Object containing parameters for the change file creation
		 * @param {string}  propertyBag.controlId -
		 * 						ID of the control containing all prefixed except the id of the application component
		 * @param {string}  propertyBag.type - Type of the change. i.e. <code>propertyChange</code>
		 * @param {boolean} propertyBag.isCustomer - Flag if the project is related to a customer project
		 * @param {string}  propertyBag.projectId - ???
		 * @param {string}  propertyBag.creatingTool - Name of the tool calling this function for support reasons
		 * @param {string}  propertyBag.sapui5Version - SAPUI5 version for which the change is created
		 * @param {Object}  [propertyBag.content] - Content of the change needed by the corresponding change handler
		 * @param {string}  [propertyBag.id] - Change ID. This will be provided on the first <code>toString</code>
		 * 						operation and must kept in further <code>toString</code> operations
		 * @param {string}  [propertyBag.reference] - Reference to the application
		 * @param {string}  [propertyBag.appVersion] - Version of the application or a placeholder replaced in the build
		 * @param {string}  [propertyBag.creation] - String with the creation timestamp. This will be created on the
		 * 						first <code>toString</code> operation and must passed in further calls
		 * @param {Object}  [manifest] - Manifest of the application; needed to determine <code>reference</code> &
		 * 						<code>appVersion</code> if not already provided in the <code>propertyBag</code>
		 * @returns {string} Change object needed and understood by the SAPUI5 runtime
		 */
		toString: function(propertyBag, manifest) {
			if (
				!propertyBag.type ||
				!propertyBag.controlId ||
				!(typeof propertyBag.isCustomer === "boolean") ||
				!propertyBag.creatingTool ||
				// manifest or the combination of reference & appVersion is required
				!((!!propertyBag.reference && !!propertyBag.appVersion) || !!manifest)
			) {
				throw Error("not all parameters of the change were provided");
			}

			const reference = propertyBag.reference || getFlexReference(manifest);
			const appVersion = propertyBag.appVersion || getAppVersion(manifest);
			const projectId = propertyBag.projectId || getProjectId(manifest, reference);

			return JSON.stringify({
				fileName: propertyBag.id || uid().replace(/-/g, "_") + "_" + propertyBag.type,
				fileType: "change",
				changeType: propertyBag.type,
				moduleName: "",
				reference: reference,
				packageName: "",
				content: propertyBag.content || {},
				selector: {
					id: propertyBag.controlId,
					idIsLocal: true
				},
				layer: propertyBag.isCustomer ? "CUSTOMER_BASE" : "VENDOR",
				texts: {},
				namespace: "apps/" + reference.replace(".Component", "") + "/changes/",
				projectId: projectId,
				creation: propertyBag.creation || new Date().valueOf(),
				originalLanguage: "",
				support: {
					generator: FLEX_API_PREFIX + propertyBag.creatingTool,
					service: "",
					user: "",
					sapui5Version: propertyBag.sapui5Version,
					sourceChangeFileName: "",
					compositeCommand: ""
				},
				oDataInformation: {},
				dependentSelector: {},
				validAppVersions: {
					from: appVersion,
					to: appVersion,
					creation: appVersion

				},
				jsOnly: false,
				variantReference: "",
				appDescriptorChange: false
			});
		}
	}
};
