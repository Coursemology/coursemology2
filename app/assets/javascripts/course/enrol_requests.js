var coursemologyApp = angular.module('coursemologyApp', ['ngResource', 'ngAnimate']);

coursemologyApp.controller('enrolRequestListController', function($scope, $http, $timeout) {
  $scope.studentRequests = [];
  $scope.staffRequests = [];
  $scope.loading = false;
  $scope.studentRequestsCheckAll = false;
  $scope.staffRequestsCheckAll = false;

  $scope.alertMessage = null;
  $scope.alertSuccess = null;
  $scope.timeoutPromise = null;

  $scope.updateList = function() {
    $scope.loading = true;
    var updateCheckedStatus = function(requests) {
      for (request in requests) {
        request.checked = false;
      }
    };
    $http.get(enrolRequestsPath)
      .success(function(data) {
        $scope.studentRequests = data.student_requests;
        $scope.staffRequests = data.staff_requests;
        updateCheckedStatus($scope.studentRequests);
        updateCheckedStatus($scope.staffRequests);
        $scope.loading = false;
      });
  };

  angular.element(document).ready($scope.updateList);

  $scope.deleteRequest = function(request, fromList) {
    var i = fromList.indexOf(request);
    if (i != -1) {
      // There should be only one request in fromList. So this is safe
      fromList.splice(i, 1);
    }
  };

  $scope.deleteRequestsWithIds = function(fromList, ids) {
    if (ids.constructor === Array && ids.length > 0) {
      fromList
        .filter(function(request) {
          return ids.indexOf(request.id) != -1;
        })
        .forEach(function(request) {
          $scope.deleteRequest(request, fromList);
        });
    }
  };

  $scope.startAlertTimeout = function() {
    if ($scope.timeoutPromise) {
      $timeout.cancel($scope.timeoutPromise);
    }

    $scope.timeoutPromise = $timeout(function() {
      $scope.alertMessage = null;
      $scope.timeoutPromise = null;
    }, 5000);
  };

  $scope.showAlert = function(msg, success) {
    $scope.alertMessage = msg;
    $scope.alertSuccess = success;
    $scope.startAlertTimeout();
  };

  $scope.checkAll = function(shouldCheckAll, requests) {
    requests.forEach(function(request) {
      request.checked = shouldCheckAll;
    });
  };

  $scope.getSelectedIds = function(fromList) {
    return fromList
      .filter(function(request) {
        return request.checked
      })
      .map(function(request) {
        return request.id
      });
  };

  $scope.processEnrolRequests = function(path, requestIds, fromList) {
    var makeResponseHandler = function(success) {
      return function(data) {
        $scope.updateCourseInfo(data);
        $scope.alertMessage(data.message, success);
        $scope.deleteRequestsWithIds(fromList, data.processed_ids);
      };
    };

    if (requests && requests.constructor === Array && requests.length > 0) {
      $http.post(path, {enrol_requestIds: requestIds})
        .success(makeResponseHandler(true))
        .error(makeResponseHandler(false))
    }
  };

  $scope.deleteButtonClicked = function(requestId, fromList) {
    $scope.processEnrolRequests(deleteEnrolRequestsPath, [requestId], fromList);
  };

  $scope.approveButtonClicked = function(requestId, fromList) {
    $scope.processEnrolRequests(approveEnrolRequestsPath, [requestId], fromList);
  };

  $scope.deleteSelectedButtonClicked = function(fromList) {
    var requestIds = $scope.getSelectedIds(fromList);
    $scope.processEnrolRequests(deleteEnrolRequestsPath, requestIds, fromList);
  };

  $scope.approveSelectedButtonClicked = function(fromList) {
    var requestIds = $scope.getSelectedIds(fromList);
    $scope.processEnrolRequests(approveEnrolRequestsPath, requestIds, fromList);
  };

  $scope.deleteAllButtonClicked = function(fromList) {
    fromList.forEach(function(request) {
      request.checked = true;
    });
    var requestIds = $scope.getSelectedIds(fromList);
    $scope.processEnrolRequests(deleteEnrolRequestsPath, requestIds, fromList);
  };

  $scope.approveAllButtonClicked = function(fromList) {
    fromList.forEach(function(request) {
      request.checked = true;
    });
    var requestIds = $scope.getSelectedIds(fromList);
    $scope.processEnrolRequests(approveEnrolRequestsPath, requestIds, fromList);
  }
});
