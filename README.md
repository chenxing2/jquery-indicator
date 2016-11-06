# Jindicator



## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/chenxing2/jquery-indicator/master/dist/JIndicator.min.js
[max]: https://raw.github.com/chenxing2/jquery-indicator/master/dist/JIndicator.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/jquery.JIndicator.min.js"></script>
<script>
$('#demo').JIndicator({
    barValues: [, 20, 60,],
    indicatorValue: 50
});
</script>
```

## Documentation
_(Coming soon)_

## Examples
``` html
<html lang="zh-CN">
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        <script src="jquery.js"></script>
        <script src="dist/jquery.JIndicator.min.js"></script>
    </head>
    <body>
        <div id="demoCanvas"></div>
        <p>sadsadas</p> 
    </body>
    <script type="text/javascript">
        
        $('#demoCanvas').JIndicator({/*
            barColor: {
                left: '#123456',
                middle: '#e34222',
                right: '#a9a233'
            },*/
            barValues: [, 20, 60,]
            // barHeight: 15,
            // canvasHeight: 70,
            // canvasWidth: 800,
            // barWidth: 200
        });
        
        $('#demoCanvas').JIndicator({'indicatorValue': 120});
       
    </script>
</html>
```

## Release History
_(Nothing yet)_
