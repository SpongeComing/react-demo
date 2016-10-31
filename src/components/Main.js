require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

let imgDatas = require('json!../data/imageDatas.json');

//利用自执行函数将图片名信息转为图片路径信息
imgDatas = ((imgDataArr) => {
  for(var i =0, j= imgDataArr.length; i < j; i++){
    let singleImgData = imgDataArr[i];
    singleImgData.imgURL = require('../images/'+singleImgData.fileName);
    imgDataArr[i] = singleImgData;
  }
  return imgDataArr;

})(imgDatas)

//获取区间内的一个随机值
let getRangeRandom = (low, high) => {
  return Math.floor(Math.random() * (high - low) + low);
}

//获取0~30deg的任意正负值（左右旋转）
let get30DegRandom = () =>{
  return (Math.random() > 0.5 ? '+' : '-') + Math.floor(Math.random() * 30);
}

class ImgFigure extends React.Component {
  constructor(){
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  /*
  *imgFigure的点击处理函数
  */
  handleClick (e){

    if (this.props.arrange.isCenter) {
      this.props.inverse();
    }else{
      this.props.center();
    }
    e.stopPropagation();
    e.preventDefault();
  }

  render (){

    var styleObj = {};
    //如果props属性中指定了这张图片的位置，则使用
    if(this.props.arrange.pos){
      styleObj = this.props.arrange.pos;
    }

    //如果图片旋转角度有值且不为0，添加角度
    if(this.props.arrange.rotate) {
      (['webkit','moz','ms','']).forEach((value) =>{
        styleObj[value + 'transform'] = 'rotate(' + this.props.arrange.rotate + 'deg)';
      })
    }

    if(this.props.arrange.isCenter){
      styleObj.zIndex = 11;
    }

    var imgFigureClassName = 'img-figure';
    imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' :'';

    return (
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
        <img src={this.props.data.imgURL} alt={this.props.data.title} />
        <figcaption>
          <h2 className='img-title'>{this.props.data.title}</h2>
          <div className='img-back' onClick={this.handleClick}>
            <p>
              {this.props.data.desc}
            </p>
          </div>
        </figcaption>
      </figure>
    )
  }
}

//控制组件
class ControllerUnit extends React.Component {
  constructor(){
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e){

    //如果点击的是当前正在选中的按钮，则翻转图片，否则将对应的图片居中
    if (this.props.arrange.isCenter) {
      this.props.inverse();
    } else {
      this.props.center();
    }
    e.stopPropagation();
    e.preventDefault();
  }

  render(){

    let controllerUnitClassName = 'controller-unit';

    //如果对应的是居中的图片，显示控制按钮的居中状态
    if (this.props.arrange.isCenter) {
      controllerUnitClassName += ' is-center';

      //如果同时对应的是翻转的图片，显示控制按钮的翻转状态
      if (this.props.arrange.isInverse) {
        controllerUnitClassName +=' is-inverse';
      }
    }

    return (
      <span className={controllerUnitClassName} onClick={this.handleClick}></span>
    )
  }
}

class AppComponent extends React.Component {
  constructor(){
    super();
    //排布取值范围
    this.Constant = {
      centerPos:{
        left:0,
        right:0
      },
      hPosRange: { //水平方向取值范文
        leftSecX: [0 ,0],
        rightSecX: [0, 0],
        y: [0 ,0]
      },
      vPosRange: { //垂直方向取值范围
        x: [0, 0],
        topY: [0, 0]
      }

    };

    this.state = {
      imgsArrangeArr :[
        /*{
          pos: {
            left : '0',
            top: '0'
          },
          rotate: 0,//旋转角度
          isInverse: false,//表示图片正(false)反面
          isCenter: false//是否居中
        }*/
      ]
    };
  }

/*
*利用 rearrange函数，居中对应的index的图片
*@param index，需要被居中的图片对应的图片信息数组的index值
*@return {Function}
*/

center(index) {
  return () =>{
    this.rearrange(index);
  }
}


/*
 *翻转图片
 *@param index 输入当前被执行inverse操作的图片对于的图片信息数组的index值
 *@return {Function}这是一个闭包函数，其内return一个真正待执行的函数
*/
inverse(index){
  return () =>{
    let imgsArrangeArr = this.state.imgsArrangeArr;

    imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;

    this.setState ({
      imgsArrangeArr :imgsArrangeArr
    })
  }
}


  /*
  *重新布局所有图片
  *@param centerIndex指定居中排布那个图片
  */
  rearrange(centerIndex){

    let imgsArrangeArr = this.state.imgsArrangeArr,
        Constant = this.Constant,
        centerPos = Constant.centerPos,
        hPosRange = Constant.hPosRange,
        vPosRange = Constant.vPosRange,
        hPosRangeLeftSecX = hPosRange.leftSecX,
        hPosRangeRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,

        vPosRangeTopY = vPosRange.topY,
        vPosRangeX = vPosRange.x,

        //上侧区域布局
        imgsArrangeTopArr = [],
        topImgNum = Math.floor(Math.random() * 2),//取一个或者不取
        topImgSpliceIndex = 0 ,

        //拿到居中图片的状态
        imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);

        //首先居中 centerIndex 的图片,居中的centerIndex 图片不需要旋转
        imgsArrangeCenterArr[0] = {
          pos : centerPos,
          rotate: 0,
          isCenter: true
        };

        //居中的centerIndex的图片不需要旋转
        imgsArrangeCenterArr[0].rotate = 0;

        //取出要布局上侧的图片的状态信息
          topImgSpliceIndex = Math.floor(Math.random() * imgsArrangeArr.length - topImgNum);
          imgsArrangeTopArr = imgsArrangeArr.splice(
             topImgSpliceIndex, topImgNum);
          //布局上侧图片
          imgsArrangeTopArr.forEach(function(value, index){
            imgsArrangeTopArr[index] ={
              pos : {
                top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
                left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
              },
              rotate: get30DegRandom(),
              isCenter: false
            }

          });

          //布局左右两侧图片
          for(let i = 0, j = imgsArrangeArr.length, k = j /2;
           i < j; i++){

            let hPosRangeLORx = null;//左或右

            //前半部分布局左边，右半部分分右边
            if ( i < k) {
              hPosRangeLORx = hPosRangeLeftSecX;
            }else{
              hPosRangeLORx = hPosRangeRightSecX;
            }

            imgsArrangeArr[i] ={
              pos : {
                top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
                left: getRangeRandom(hPosRangeLORx[0], hPosRangeLORx[1])
              },
              rotate: get30DegRandom(),
              isCenter: false
            };

          }

          if(imgsArrangeTopArr && imgsArrangeTopArr[0]) {
            imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
          }

          imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

          this.setState({
            imgsArrangeArr : imgsArrangeArr
          });


  }
  //组件加载后，计算每张图片的位置范围
  componentDidMount() {

    //拿到舞台大小
    let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
        stageW = stageDOM.scrollWidth,
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil(stageW/2),
        halfStageH = Math.ceil(stageH/2);


        //拿到一个imgFigure的大小
    let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = Math.ceil(imgW/2),
        halfImgH = Math.ceil(imgH/2);

    //中心点值
    this.Constant.centerPos = {
      left: halfStageW- halfImgW,
      top: halfStageH - halfImgH
    };
    //计算左侧、右侧图片排布范围
    this.Constant.hPosRange.leftSecX[0] = -halfImgW;
    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW*3;

    this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;

    this.Constant.hPosRange.y[0] = -halfImgH;
    this.Constant.hPosRange.y[0] = stageH - halfImgH;

    //计算上侧图片排布范围
    this.Constant.vPosRange.topY[0] = -halfImgH;
    this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
    this.Constant.vPosRange.x[0] = halfStageW - imgW;
    this.Constant.vPosRange.x[1] = halfStageW;

    let num = Math.floor(Math.random() * 10);

    this.rearrange(num);
  }
  render() {

      let controllerUnits = [];//控制组件
      let imgFigures = [];//包含所有图片

      imgDatas.forEach(function(value, index) {

        if(!this.state.imgsArrangeArr[index]){
          this.state.imgsArrangeArr[index] = {
            pos :{
              left: 0,
              top: 0
            },
            rotate: 0,
            isInverse: false,
            isCenter: false
          };
        }

        imgFigures.push(<ImgFigure data = {value} key={index} ref={'imgFigure'+index}
          arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)} />);

        controllerUnits.push(<ControllerUnit key={index} arrange={this.state.imgsArrangeArr[index]}
        inverse={this.inverse(index)} center={this.center(index)} />);
      }.bind(this));



    return (
     <section className='stage' ref='stage'>
        <section className='img-sec'>
          {imgFigures}
        </section>

        <nav className='controller-nav'>
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
