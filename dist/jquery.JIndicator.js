/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>
<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */
/*global $, jQuery*/
(function ($) {

    "use strict";
    
    var JIndicator = function (ele, opt) {
        this.$element = $(ele);
        this.defaults = {
            canvasHeight: 70,
            canvasWidth: 500,
            startX: 10,
            barHeight: 12,
            barWidth: 150,
            barColor: {
                left: '#7BD6FD',
                middle: '#77DE8B',
                right: '#FFC977'
            },
            indicatorColor: 'auto',
            numberText: {
                color: '#000000',
                fontSize: 13,
                fontFamily: 'Arial',
                align: 'left',
                fontHeight: 12
            },
            barValues: [],
            indicatorValue: 0,
            legend: {
                data: ['low', 'middle', 'high'],
                textColor: '#000000'
            },
            legendHeight: 15,
            legendProperty : {
                height: 15,
                width: 24,
                margin: 15,
                radius: 4
            }
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
            
            return self.indicator.drawCanvas(self);
        });
    };
    
    function initProperty(canvas, context, options) {
        
        if (options.legend && options.legend.data && options.legend.data.length === 3) {
            options.middleHeight = (options.canvasHeight / 2) + options.legendHeight;
        } else {
            options.middleHeight = options.canvasHeight / 2;
        }
        options.tHeight = options.barHeight * Math.sin(Math.PI / 3);
        options.triangleHeight = options.tHeight + 8;
        
        canvas.height += 0;
        
        context.font = (options.numberText.fontSize + 'px ' + options.numberText.fontFamily);
        context.textAlign = options.numberText.align;
    }

    // left
    function drawLeft(context, options) {
        context.beginPath();
        context.moveTo(options.startX, options.middleHeight);
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
        context.moveTo(options.startX + options.barWidth * 3, options.middleHeight);
        context.lineTo(options.startX + options.barWidth * 3 - options.triangleHeight, options.middleHeight - options.barHeight / 2);
        context.lineTo(options.startX + options.barWidth * 3 - options.triangleHeight, options.middleHeight + options.barHeight / 2);
        context.fill();
        context.closePath();
    }
    
    function drawRoundRect(context, x, y, width, height, radius, color) {
        context.beginPath();
        context.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
        context.lineTo(width - radius + x, y);
        context.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
        context.lineTo(width + x, height + y - radius);
        context.arc(width - radius + x, height - radius + y, radius, 0, Math.PI / 2);
        context.lineTo(radius + x, height + y);
        context.arc(radius + x, height - radius + y, radius, Math.PI / 2, Math.PI);
        context.fillStyle = color;
        context.fill();
        context.closePath();
    }
    
    // Legend
    function drawLegend(context, options) {
        var textMargin = options.legendProperty.margin / 3,
            metrics,
            y = 5,
            x = options.canvasWidth / 2,
            leftWidth = options.legendProperty.margin + options.legendProperty.width + context.measureText(options.legend.data[0]).width,
            halfMiddleWidth;
        
        halfMiddleWidth = (options.legendProperty.width + context.measureText(options.legend.data[1]).width + textMargin) / 2;
        leftWidth = options.legendProperty.width + context.measureText(options.legend.data[0]).width + textMargin;
        
        x = x - halfMiddleWidth - leftWidth - options.legendProperty.margin;
        drawRoundRect(context, x, y, options.legendProperty.width, options.legendProperty.height, options.legendProperty.radius, options.barColor.left);
        context.fillStyle = options.legend.textColor;
        context.fillText(options.legend.data[0], x + options.legendProperty.width + textMargin, y + options.legendProperty.height - 5);
        
        x = x + leftWidth + options.legendProperty.margin;
        drawRoundRect(context, x, y, options.legendProperty.width, options.legendProperty.height, options.legendProperty.radius, options.barColor.middle);
        context.fillStyle = options.legend.textColor;
        context.fillText(options.legend.data[1], x + options.legendProperty.width + textMargin, y + options.legendProperty.height - 5);
        
        x = x + halfMiddleWidth * 2 + options.legendProperty.margin;
        drawRoundRect(context, x, y, options.legendProperty.width, options.legendProperty.height, options.legendProperty.radius, options.barColor.right);
        context.fillStyle = options.legend.textColor;
        context.fillText(options.legend.data[2], x + options.legendProperty.width + textMargin, y + options.legendProperty.height - 5);
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
            retValue.color = options.barColor.middle;
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
        // half circle
        context.arc(position.positionX, options.middleHeight - options.barHeight - 4, options.barHeight / 2, 0, Math.PI, 1);
        context.fillStyle = position.color;
        context.fill();
        // triangle
        context.moveTo(position.positionX - options.barHeight / 2 - 1, position.positionArcY);
        context.lineTo(position.positionX,  position.positionTriY);
        context.lineTo(position.positionX + options.barHeight / 2 + 1,  position.positionArcY);
        context.fillStyle = position.color;
        context.fill();
        context.closePath();
        
        // draw Indicator number text
        context.fillText(options.indicatorValue,
                         position.positionX + options.barHeight / 2 + 3, position.positionTriY - options.triangleHeight / 6);
    }

    // Number
    function drawNumber(context, options) {
        var metrics,
            i,
            positonX;
      
        context.fillStyle = options.numberText.color;
      
        for (i = 0; i < options.barValues.length; i += 1) {
            if (!isNaN(options.barValues[i])) {
                positonX = options.startX + options.barWidth * i;
                metrics = context.measureText(options.barValues[i]);
                context.fillText(options.barValues[i], positonX - metrics.width / 2,
                             options.middleHeight + options.barHeight / 2 + options.numberText.fontHeight + 3);
            }
        }
    }
    
    function draw($element, options) {
        // 
        var canvas,
            context,
            sCanvas;
        
        options.canvasWidth = options.barWidth * 3 + options.startX * 2;
        if ($element.find('#jIndicatorCanvas').length === 0) {
            // ...
            options.canvasHeight = options.canvasHeight * 2;
            options.canvasWidth = options.canvasWidth * 2;
            options.barHeight = options.barHeight * 2;
            options.barWidth = options.barWidth * 2;
            options.numberText.fontHeight = options.numberText.fontHeight * 2;
            options.numberText.fontSize = options.numberText.fontSize * 2;
            options.legendHeight = options.legendHeight * 2;
            options.legendProperty.height = options.legendProperty.height * 2;
            options.legendProperty.width = options.legendProperty.width * 2;
            options.legendProperty.margin = options.legendProperty.margin * 2;
            options.legendProperty.radius = options.legendProperty.radius * 2;
            
            sCanvas = '<canvas id="jIndicatorCanvas" width="' + options.canvasWidth + '" height="' + options.canvasHeight + '"';
            sCanvas += ' style="width: ' + options.canvasWidth / 2 + 'px; height: ' + options.canvasHeight / 2 + 'px;"';
            sCanvas += '></canvas>';
            $element.append(sCanvas);
        }
        canvas = $element.find('#jIndicatorCanvas').get(0);
        context = canvas.getContext("2d");
        
        initProperty(canvas, context, options);
        
        // Left
        drawLeft(context, options);

        // Middle
        drawMiddle(context, options);

        // Right
        drawRight(context, options);
        
        // Legend
        if (options.legend && options.legend.data && options.legend.data.length === 3) {
            drawLegend(context, options);
        }

        // Indicator
        drawIndicator(context, options);

        // Number
        drawNumber(context, options);
    }
    
    JIndicator.prototype = {
        drawCanvas: function (self) {
            draw(this.$element, this.options);
            return self.indicator;
        }
    };

}(jQuery));
