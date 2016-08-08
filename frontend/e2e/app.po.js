"use strict";
var FakePage = (function () {
    function FakePage() {
    }
    FakePage.prototype.navigateTo = function () {
        return browser.get('/');
    };
    FakePage.prototype.getParagraphText = function () {
        return element(by.css('app-root h1')).getText();
    };
    return FakePage;
}());
exports.FakePage = FakePage;
//# sourceMappingURL=app.po.js.map