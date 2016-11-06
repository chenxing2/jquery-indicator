/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>
<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */
(function ($) {

    "use strict";
    
    var JIndicator = function (ele, opt) {
        this.$element = $(ele);
        this.defaults = {
            canvasHeight: 50,
            canvasWidth: 500,
            startX: 20,
            barHeight: 8,
            barWidth: 150,
            barColor: {
                left: '#7BD6FD',
                middle: '#77DE8B',
                right: '#FFC977'
            },
            indicatorColor: 'auto',
            numberText: {
                color: '#000000',
                font: '13px Arial',
                align: 'left',
                fontHeight: 12
            },
            barValues: [],
            indicatorValue: 0
        };
        this.options = $.extend({}, this.defaults, this.options, typeof opt === 'object' && opt);
    };
    
    // Collection method.
    $.fn.JIndicator = function (options) {
        return this.each(function () {
            var self = this;
            
            if (self.indicator === undefined) {
                self.indicator = new JIndicator(this, options);
            } else {
                self.indicator.options = $.extend({}, self.indicator.options, options);
            }
            
            return self.indicator.indicator();
        });
    };
    
    function initProperty(canvas, context, options) {
        var dpr,
            bsr,
            ratio;
        
        dpr = window.devicePixelRatio || 1;
        bsr = context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;

        ratio = dpr / bsr;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        
        options.middleHeight = options.canvasHeight / 2;
        options.tHeight = options.barHeight * Math.sin(Math.PI / 3);
        options.triangleHeight = options.tHeight + 8;
        
        // context.clearRect(0, 0, options.canvasWidth, options.canvasHeight);
        canvas.height = canvas.height;
    }

    // left
    function drawLeft(context, options) {
        context.beginPath();
        context.moveTo(options.startX, options.canvasHeight / 2);
        context.lineTo(options.startX + options.triangleHeight, options.middleHeight - options.barHeight / 2);
        context.lineTo(options.startX + options.triangleHeight, options.middleHeight + options.barHeight / 2);
        context.fillStyle = options.barColor.left;
        context.fill();
        context.closePath();
        context.fillRect(options.startX + options.triangleHeight, options.middleHeight - options.barHeight / 2,
                         options.barWidth - options.triangleHeight, options.barHeight);
    }

    // middle
    function drawMiddle(context, options) {
        context.fillStyle = options.barColor.middle;
        context.fillRect(options.startX + options.barWidth, options.middleHeight - options.barHeight / 2, options.barWidth, options.barHeight);
    }

    // right
    function drawRight(context, options) {
        context.fillStyle = options.barColor.right;
        context.fillRect(options.startX + options.barWidth * 2, options.middleHeight - options.barHeight / 2,
                         options.barWidth - options.triangleHeight, options.barHeight);
        context.beginPath();
        context.moveTo(options.startX + options.barWidth * 3, options.canvasHeight / 2);
        context.lineTo(options.startX + options.barWidth * 3 - options.triangleHeight, options.middleHeight - options.barHeight / 2);
        context.lineTo(options.startX + options.barWidth * 3 - options.triangleHeight, options.middleHeight + options.barHeight / 2);
        context.fill();
        context.closePath();
    }

    function getIndicatorInfo(options) {
        var min = 0,
            max = 0,
            retValue = {
                color: options.barColor.left,
                positionX: options.startX,
                positionArcY: options.middleHeight - options.barHeight - 4,
                positionTriY: options.middleHeight - options.barHeight / 2 - 1
            };
        // return zero
        if (isNaN(options.indicatorValue)) {
            return retValue;
        }
        // must have two values
        if (options.barValues.length < 3 || isNaN(options.barValues[1]) || isNaN(options.barValues[2])) {
            return retValue;
        }
        
        retValue.color = options.barColor.left;
        if (options.indicatorValue < options.barValues[1]) {
            if (isNaN(options.barValues[0])) {
                retValue.positionX = options.startX + options.barWidth / 2;
                return retValue;
            } else {
                if (options.indicatorValue < options.barValues[0]) {
                    retValue.positionX = options.startX;
                    return retValue;
                } else {
                    retValue.positionX = options.startX + options.barWidth * (options.indicatorValue - options.barValues[0]) / (options.barValues[1] - options.barValues[0]);
                    return retValue;
                }
            }
        } else if (options.indicatorValue === options.barValues[1]) {
            retValue.positionX = options.startX + options.barWidth;
            return retValue;
        }
        
        retValue.color = options.barColor.right;
        if (options.indicatorValue > options.barValues[2]) {
            if (options.barValues.length === 3 || isNaN(options.barValues[3])) {
                retValue.positionX = options.startX + options.barWidth * 2 + options.barWidth / 2;
                return retValue;
            } else {
                if (options.indicatorValue > options.barValues[3]) {
                    retValue.positionX = options.startX + options.barWidth * 3;
                    return retValue;
                } else {
                    retValue.positionX = options.startX + options.barWidth * 2 + options.barWidth * (options.indicatorValue - options.barValues[2]) / (options.barValues[3] - options.barValues[2]);
                    return retValue;
                }
            }
        } else if (options.indicatorValue === options.barValues[2]) {
            retValue.positionX = options.startX + options.barWidth * 2;
            return retValue;
        }
        
        retValue.color = options.barColor.middle;
        retValue.positionX = options.startX + options.barWidth
            + options.barWidth * (options.indicatorValue - options.barValues[1]) / (options.barValues[2] - options.barValues[1]);
        return retValue;
    }
    
    // Indicator
    function drawIndicator(context, options) {
        var color = options.indicatorColor,
            position = getIndicatorInfo(options);
        
        if (color !== 'auto') {
            position.color = color;
        }
        
        context.beginPath();
        context.arc(position.positionX, options.middleHeight - options.barHeight - 4, options.barHeight / 2, 0, Math.PI, 1);
        context.fillStyle = position.color;
        context.fill();
        context.moveTo(position.positionX - options.barHeight / 2 - 1, position.positionArcY);
        context.lineTo(position.positionX,  position.positionTriY);
        context.lineTo(position.positionX + options.barHeight / 2 + 1,  position.positionArcY);
        context.fillStyle = position.color;
        context.fill();
    }

    // Number
    function drawNumber(context, options) {
        var metrics,
            i,
            positonX;
      
        context.font = options.numberText.font;
        context.textAlign = options.numberText.align;
        context.fillStyle = options.numberText.color;
      
        for (i = 0; i < options.barValues.length; i++) {
            if (isNaN(options.barValues[i])) {
                continue;
            }
            positonX = options.startX + options.barWidth * i;
            metrics = context.measureText(options.barValues[i]);
            context.fillText(options.barValues[i], positonX - metrics.width / 2,
                         options.middleHeight + options.barHeight / 2 + options.numberText.fontHeight + 3);
        }
    }
    
    function draw($element, options) {
        // 
        var canvas,
            context;
        
        $element.append('<canvas id="jIndicatorCanvas" width="' + options.canvasWidth + '"></canvas>');
        canvas = $element.find('#jIndicatorCanvas').get(0);
        context = canvas.getContext("2d");
        
        initProperty(canvas, context, options);
        
        // Left
        drawLeft(context, options);

        // Middle
        drawMiddle(context, options);

        // Right
        drawRight(context, options);

        // Indicator
        drawIndicator(context, options);

        // Number
        drawNumber(context, options);
    }
    
    JIndicator.prototype = {
        indicator: function () {
            draw(this.$element, this.options);
            return this;
        }
    };

}(jQuery));
