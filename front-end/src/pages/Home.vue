<style lang="scss">
  #Home {
    .top {
      border-bottom: 1px solid rgb(68, 68, 68);
      position: absolute;
      width: 100%;
      height: 56px;
      background: rgb(51, 51, 51);

      .file-select {
        position: absolute;
        display: inline-block;
        top: 8px;
        left: 20px;
        text-align: center;
        height: 40px;
        color: white;
        line-height: 40px;
        border-radius: 8px;
        width: 160px;
        background-color: #242424;

        &:hover {
          cursor: pointer;
          box-shadow: 1px 1px 6px #444444;
          transition: all .2s ease-out;
        }

        &:active {
          box-shadow: 2px 2px 6px #666;
        }
      }

      .operate-wrapper {
        position: absolute;
        top: 12px;
        left: 500px;
        width: 580px;
        display: inline-block;

        &:hover {
          cursor: default;
        }

        button {
          border: none;
          background-color: transparent;
          outline: none;

          i {
            font-size: 30px;
            color: #a8a8a8;
          }
        }
      }
    }

    .left {
      overflow: auto;
      background: #333333;
      border-right: solid 1px #444444;
      position: absolute;
      top: 60px;
      width: 196px;
      bottom: 0;
    }

    #webgl {
      position: absolute;
      top: 60px;
      left: 200px;
    }
  }
</style>
<template>
  <div id="Home">
    <div class="top">
      <input type="file" id="file-input" @change="getFilePath"
             style="filter:alpha(opacity=0);opacity:0;width: 0;height: 0;"/>
      <div class="file-select" @click="selectFile">
        {{fileName || '请选择模型'}}
      </div>
      <div class="operate-wrapper">
        <button @click="resetModel">
          <i class="iconfont icon-reset"></i>
        </button>
        <button @click="handleEnlarge">
          <i class="iconfont icon-enlarge"></i>
        </button>
        <button @click="handleNarrow">
          <i class="iconfont icon-narrow"></i>
        </button>
        <button @click="showHide('centerAxis')">
          <i class="iconfont icon-axis"></i>
        </button>
        <button @click="showHide('bottomGrid')">
          <i class="iconfont icon-grid"></i>
        </button>
      </div>
    </div>
    <div class="left"></div>
    <div id="webgl"></div>
  </div>
</template>
<script>
  import * as Three from 'three';
  import OrbitControls from 'three-orbitcontrols'; // 引入鼠标操作三维场景
  const STLLoader = require('three-stl-loader')(Three);

  export default {
    name: 'Home',
    data() {
      return {
        scene: new Three.Scene(), // 创建场景对象Scene
        point: null, // 光源设置 点光源
        ambient: null, // 环境光
        mesh: null,
        width: window.innerWidth - 200, //窗口宽度
        height: window.innerHeight - 60, //窗口高度
        k: null, // 窗口宽高比
        s: null, // 三维场景显示范围控制系数，系数越大，显示的范围越大
        camera: {}, // 创建相机对象
        renderer: new Three.WebGLRenderer(), // 创建渲染器对象
        loader: new STLLoader(), // 加载stl文件
        controls: {}, //创建控件对象
        fileName: '', // 当前文件名称
        filePath: '', // 当前文件路径
        selectedObject: null, // 选择物体
        gridGroup: null, // 网格组
        axisGroup: null, // 中心坐标组
        initialSight: null, // 初始化模型视野
      }
    },
    mounted() {
      this.initialScene();
      window.onresize = () => {
        this.handleReset(); // 处理页面放缩
      }
    },
    methods: {
      render() {
        this.renderer.render(this.scene, this.camera);//执行渲染操作
      },
      handleReset() {
        this.width = window.innerWidth - 200;
        this.height = window.innerHeight - 60;
        this.renderer.setSize(this.width, this.height);
        // 重置相机投影的相关参数
        this.k = this.width / this.height;//窗口宽高比
        this.camera.left = -this.s * this.k;
        this.camera.right = this.s * this.k;
        this.camera.top = this.s;
        this.camera.bottom = -this.s;
        // 渲染器执行render方法的时候会读取相机对象的投影矩阵属性projectionMatrix
        // 但是不会每渲染一帧，就通过相机的属性计算投影矩阵(节约计算资源)
        // 如果相机的一些属性发生了变化，需要执行updateProjectionMatrix ()方法更新相机的投影矩阵
        this.camera.updateProjectionMatrix();
        this.render();
      },
      // 添加鼠标控制
      orbitControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);//创建控件对象
        this.renderer.domElement.removeAttribute("tabindex");
        this.controls.addEventListener('change', this.render);
      },
      // 计算合适视野
      computeSight(data) {
        let temp = new Array(3);
        temp[0] = data.max.x - data.min.x;
        temp[1] = data.max.y - data.min.y;
        temp[2] = data.max.z - data.min.z;
        return Math.floor(Math.max(...temp) * 1.1);
      },
      // 加载stl模型
      loadSTL(url) {
        this.scene.remove(this.mesh);
        // 创建网格模型
        this.loader.load(url, (geometry) => {
          geometry.computeBoundingBox();
          this.initialSight = this.computeSight(geometry.boundingBox);
          let material = new Three.MeshLambertMaterial({
            color: 0x0095ff,
            side: Three.DoubleSide,
          });
          this.mesh = new Three.Mesh(geometry, material);
          this.scene.add(this.mesh);
          this.mesh.geometry.center();
          this.resetModel();
        });
      },
      drawGrid() {
        const len = 1000;
        this.gridGroup = new Three.Group();
        let geometry = new Three.Geometry();
        geometry.vertices.push(new Three.Vector3(-len, -510, 0));
        geometry.vertices.push(new Three.Vector3(len, -510, 0));
        for (let i = 0; i <= 40; i++) {
          //画横线
          let line1 = new Three.Line(geometry, new Three.LineBasicMaterial({color: 0xffffdd, opacity: 0.1}));
          line1.position.z = (i * 50) - len;

          let line2 = new Three.Line(geometry, new Three.LineBasicMaterial({color: 0xffffdd, opacity: 0.1}));
          line2.position.x = (i * 50) - len;
          line2.rotation.y = 90 * Math.PI / 180;   //转90度

          this.gridGroup.add(line1, line2);
        }
        this.gridGroup.name = 'bottomGrid';
        this.scene.add(this.gridGroup);
      },
      // 绘制坐标轴
      drawAxis(size) {
        this.axisGroup = new Three.Group();
        this.axisGroup.name = 'centerAxis';
        //来自原点的方向。必须是单位向量
        let dirX = new Three.Vector3(size, 0, 0);
        let dirY = new Three.Vector3(0, size, 0);
        let dirZ = new Three.Vector3(0, 0, size);
        // 规格化方向向量(转换为长度为1的向量)
        dirX.normalize();
        dirY.normalize();
        dirZ.normalize();
        // 箭头开始的点
        let origin = new Three.Vector3(0, 0, 0);
        // 箭头的长度。默认值为1
        let length = size;
        // 颜色
        let hexX = 0xff0000;
        let hexY = 0x00ff00;
        let hexZ = 0x0000ff;
        // 箭头的长度。默认值为0.2 *length
        let headLength = size / 10;
        // 箭头宽度的长度。默认值为0.2 * headLength。
        let headWidth = size / 20;
        let arrowHelperX = new Three.ArrowHelper(dirX, origin, length, hexX, headLength, headWidth);
        let arrowHelperY = new Three.ArrowHelper(dirY, origin, length, hexY, headLength, headWidth);
        let arrowHelperZ = new Three.ArrowHelper(dirZ, origin, length, hexZ, headLength, headWidth);
        this.axisGroup.add(arrowHelperX, arrowHelperY, arrowHelperZ)
        this.scene.add(this.axisGroup);
      },
      // 设置光照环境
      initialLight() {
        this.point = new Three.PointLight(0xffffff);
        this.ambient = new Three.AmbientLight(0x444444);
        this.point.position.set(200, 100, 300); //点光源位置
        this.scene.add(this.point); // 点光源添加到场景中
        this.scene.add(this.ambient); // 环境光添加到场景中
      },
      initialCamera() {
        // 相机设置
        this.s = 1000;
        this.k = this.width / this.height; //窗口宽高比
        this.camera = new Three.OrthographicCamera(-this.s * this.k, this.s * this.k, this.s, -this.s, -5000, 5000);
        this.camera.position.set(0, 0, 400); //设置相机位置
        this.camera.lookAt(this.scene.position); //设置相机方向(指向的场景对象)
      },
      initialBG() {
        this.renderer.setSize(this.width, this.height);//设置渲染区域尺寸
        this.renderer.setClearColor(0x333333, 1); //设置背景颜色
      },
      initialScene() {
        this.initialLight();
        this.initialCamera();
        this.initialBG();
        const fatherElement = document.getElementById('webgl');
        fatherElement.appendChild(this.renderer.domElement); //Home元素中插入canvas对象
        this.drawAxis(800);
        this.drawGrid();
        this.orbitControls(); // 添加鼠标控制
        this.render();
      },
      // 选择文件
      selectFile() {
        document.getElementById('file-input').click();
      },
      // 获取文件路径
      getFilePath() {
        if (document.getElementById('file-input').files.length) {
          const name =  document.getElementById('file-input').files[0].name;
          Object.assign(this, {
            fileName: name,
            filePath: 'http://10.11.30.187:8000/' + name,
          });
          this.loadSTL(this.filePath); // 加载stl模型
        }
      },
      handleEnlarge() {
        this.k = this.width / this.height; //窗口宽高比
        this.s *= 0.9;
        this.camera.left = -this.s * this.k;
        this.camera.right = this.s * this.k;
        this.camera.top = this.s;
        this.camera.bottom = -this.s;
        this.camera.updateProjectionMatrix();
        this.render();
      },
      handleNarrow() {
        this.k = this.width / this.height; //窗口宽高比
        this.s *= 1.1;
        this.camera.left = -this.s * this.k;
        this.camera.right = this.s * this.k;
        this.camera.top = this.s;
        this.camera.bottom = -this.s;
        this.camera.updateProjectionMatrix();
        this.render();
      },
      showHide(name) {
        for (let i in this.scene.children) {
          if (this.scene.children[i].name === name) {
            this.scene.children[i].visible = !this.scene.children[i].visible;
            this.render();
            return;
          }
        }
      },
      resetModel() {
        this.k = this.width / this.height; //窗口宽高比
        this.s = this.initialSight || 1000;
        this.camera.left = -this.s * this.k;
        this.camera.right = this.s * this.k;
        this.camera.top = this.s;
        this.camera.bottom = -this.s;
        this.camera.position.set(0, 0, 400); //设置相机位置
        this.camera.lookAt(this.scene.position); //设置相机方向(指向的场景对象)
        this.camera.updateProjectionMatrix();
        this.render();
      }
    }
  }
</script>

