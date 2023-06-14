export class CreateProjectResponse {
  existingDevice: boolean;
  deviceFamily: string;
  existingDeviceField: string;
  existingRevision: boolean;
  revision: string;
  existingRevisionField: string;
  existingTestType: boolean;
  testType: string;
  existingTestTypeField: string;
  block: string;

  constructor(
    existingDevice = false,
    deviceFamily = '',
    existingDeviceField = '',
    existingRevision = false,
    revision = '',
    existingRevisionField = '',
    existingTestType = false,
    testType = '',
    existingTestTypeField = '',
    block = '',
  ) {
    this.existingDevice = existingDevice;
    this.deviceFamily = deviceFamily;
    this.existingDeviceField = existingDeviceField;
    this.existingRevision = existingRevision;
    this.revision = revision;
    this.existingRevisionField = existingRevisionField;
    this.existingTestType = existingTestType;
    this.testType = testType;
    this.existingTestTypeField = existingTestTypeField;
    this.block = block;
  }
}
