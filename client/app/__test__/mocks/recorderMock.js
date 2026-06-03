// Mock for vendor/recorderjs — the actual binary is not committed to the repo
function Recorder() {}
Recorder.prototype.record = function () {};
Recorder.prototype.stop = function () {};
Recorder.prototype.clear = function () {};
Recorder.prototype.exportWAV = function (cb) {
  cb(new Blob([], { type: 'audio/wav' }));
};

module.exports = Recorder;
