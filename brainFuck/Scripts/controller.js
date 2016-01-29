 //"Hello world" : "++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>."
KNOWN_CODES = {
    "Hello world": ""
}

var app = angular.module('myApp', ['scroll']);
Commands = {};
Commands['>'] = function () {
    this.memoryPointer++;
    if (this.memoryPointer >= this.memorySize)
        this.allocMore(16);
}
Commands['<'] = function () { this.memoryPointer--; }
Commands['+'] = function () { this.memory[this.memoryPointer]++; }
Commands['-'] = function () { this.memory[this.memoryPointer]--; }
Commands['#'] = function () { this.pause(); }
Commands[','] = function () {
    var input = "";
    while (input.length == 0) {
        input = prompt("enter one character for input");
    }

    var value = input.charCodeAt(0);
    this.standardInput.push(input.charAt(0));
    this.memory[this.memoryPointer] = value;
}
Commands['.'] = function () {
    var char = String.fromCharCode(this.memory[this.memoryPointer]);
    this.standardOutput.push(char);
}
Commands['['] = function () { if (this.memory[this.memoryPointer] == 0) this._moveToLoopEnd(); }
Commands[']'] = function () { if (this.memory[this.memoryPointer] > 0) this._moveToLoopBeginning(); }

// Controller
function brainfuckController($scope, $http, $timeout) {
    // setup memory
    $scope.ops = 100;
    $scope.memorySize = 96;
    $scope.memory = new Array(this.memorySize);

    // others
    $scope.memoryPointer = 0;
    $scope.codePointer = -1;
    $scope.code = KNOWN_CODES["Hello world"];
    $scope.standardOutput = [];
    $scope.standardInput = [];
    $scope.isStarted = false;
    $scope.isRunning = false;
    $scope.isFinished = false;
    $scope.toDisplay = "values";
    $scope.memoryScrollTop = 0;
    $scope.selectedFile = 0;
    $scope.fileIndex;
    $scope.setSelectedFile = function (value) {
        console.log(value);
        this.selectedFile = value;
    }
 
    $scope.documents = [];
    $http({
        url: 'Get',
        method: 'GET'
    }).success(function (data) { $scope.documents = data; console.log(data); });


    $scope.CreateNewFile = function () {
        var NewFile = { Name: $scope.filename, Text: $scope.code };
        $http({
            method: 'POST',
            url: 'Create',
            data: { document: NewFile }
        }).success(function (data) {
            $scope.documents.push(data);
        })
    }

    $scope.DeleteFile = function () {
        $http({
            method: 'POST',
            url: 'Delete',
            data: { Id: $scope.documents[$scope.fileIndex].Id }
        }).success(function (data) {
            $scope.documents.pop(data);
        });
        $http({
            url: 'Get',
            method: 'GET'
        }).success(function (data) { $scope.documents = data; });

    }

    $scope.RenameFile = function () {
        var RenamedFile = { Name: $scope.filename, Id: $scope.documents[$scope.fileIndex].Id };
        $http({
            method: 'POST',
            url: 'Rename',
            data: { Name: $scope.filename, Id: $scope.documents[$scope.fileIndex].Id }
        }).success(function (data) {
            $scope.documents.pop(data);
            $scope.documents.push(data);
        });
        $http({
            url: 'Get',
            method: 'GET'
        }).success(function (data) { $scope.documents = data; });

    }

    $scope._reset = function () {
        for (var i = 0; i < this.memorySize; i++) this.memory[i] = 0;

        this.memoryPointer = 0;
        this.codePointer = -1;
        this.standardOutput = [];
        this.standardInput = [];
        this.isStarted = false;
        this.isRunning = false;
        this.isFinished = false;
    };
    $scope.allocMore = function (value) {
        if (value + this.memorySize < 30000) {
            this.memorySize += value;
            for (var i = 0; i < value; i++)
                this.memory.push(0);
        }
    }
    $scope.check = function () {
        console.log(this.standardOutput);
    }

    $scope.changeColor = function () {
        $scope.class = "color";
    }

    $scope.getCode = function (value,index) {
        $scope.code = value;
        $scope.fileIndex = index;
        console.log($scope.documents[$scope.fileIndex].Id);
    }
    $scope.convertToSymbol = function (value) {
        String.fromCharCode(value);
        return value <= 31 ? "NONE" : String.fromCharCode(value);
    }
    $scope._reset();

    // actions
    $scope.run = function () {
        if (this.isRunning) {
            alert("A code is already running!");
            return;
        }

        this.isRunning = true;
        this._runNext();
    }
    $scope.decimalToHexString = function (number) {
        if (number % 16 != 0) {
            return;
        }
        if (number < 0) {
            number = 0xFFFFFFFF + number + 1;
        }
        var s = number.toString(16).toUpperCase();
        while (s.length < 4) s = "0" + s;
        s = "0x" + s;
        return s;
    }

    $scope.pause = function () {
        this.isRunning = false;
    }

    $scope.next = function () {
        if (this.isRunning) {
            alert("A code is already running!");
            return;
        }

        this._runNext(true);
    }

    $scope.reset = function () {
        this._reset();
    }

    // private methods
    $scope._runNext = function (doNotRecurse) {
        if (!this.isRunning && !doNotRecurse) {
            return;
        }

        this.isStarted = true;

        if (this.codePointer >= this.code.length) {
            this._runFinished();
            return;
        }

        if (this.codePointer < 0) this._moveToNextSymbol();

        this._runSymbol(this._getSymbol());

        this._moveToNextSymbol();

        var me = this;

        if (!doNotRecurse) {
            $timeout(function () {
                me._runNext();
            }, 1000 / this.ops);
        }
    }

    $scope._getSymbol = function () { return this.code[this.codePointer]; }

    $scope._moveToNextSymbol = function () {
        do {
            this.codePointer++;
        } while (this.codePointer < this.code.length && !Commands[this._getSymbol()]);
    }

    $scope._runFinished = function () {
        this.isRunning = false;
        this.isFinished = true;
    }

    $scope._runSymbol = function (s) {
        var func = Commands[s];
        if (func) {
            func.call(this);
        }
    }

    $scope._moveToLoopEnd = function () {
        var skipCount = 0;

        this.codePointer++;
        while (true) {
            if (this.codePointer >= this.code.length) break;

            if (this._getSymbol() == ']') {
                if (skipCount == 0) break;
                skipCount--;
            }

            if (this._getSymbol() == '[') skipCount++;

            this.codePointer++;
        }
    }

    $scope._moveToLoopBeginning = function () {
        var skipCount = 0;

        this.codePointer--;
        while (true) {
            if (this.codePointer0) break;

            if (this._getSymbol() == '[') {
                if (skipCount == 0) break;
                skipCount--;
            }

            if (this._getSymbol() == ']') skipCount++;

            this.codePointer--;
        }
    }

    $scope.changeDisplay = function () {
        this.toDisplay = this.toDisplay == "symbols" ? "values" : "symbols";
    }
}

// Controller directives
app.directive('ngSelectionStart', function () {
    return {
        link: function (scope, elm, attrs) {
            scope.$watch(attrs.ngSelectionStart, function (value) {
                elm[0].selectionStart = parseInt(value) || 0;
            });
        }
    };
});

app.directive('ngSelectionEnd', function () {
    return {
        link: function (scope, elm, attrs) {
            scope.$watch(attrs.ngSelectionEnd, function (value) {
                elm[0].selectionEnd = parseInt(value) || 0;
            });
        }
    };
});


