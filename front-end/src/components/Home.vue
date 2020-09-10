<style lang="scss">
  #Home {
    .top {
      border-bottom: 1px solid rgb(68, 68, 68);
      position: absolute;
      width: 100%;
      height: 56px;
      background: rgb(51, 51, 51);
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
    <div class="top"></div>
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
        point: new Three.PointLight(0xffffff), // 光源设置 点光源
        ambient: new Three.AmbientLight(0x444444), // 环境光
        width: window.innerWidth, //窗口宽度
        height: window.innerHeight - 60, //窗口高度
        k: null, // 窗口宽高比
        s: null, // 三维场景显示范围控制系数，系数越大，显示的范围越大
        camera: {}, // 创建相机对象
        renderer: new Three.WebGLRenderer(), // 创建渲染器对象
        loader: new STLLoader(), // 加载stl文件
        controls: {}, //创建控件对象
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
        this.renderer.render(this.scene,this.camera);//执行渲染操作
      },
      handleReset() {
        this.renderer.setSize(window.innerWidth,window.innerHeight);
        // 重置相机投影的相关参数
        this.k = window.innerWidth/window.innerHeight;//窗口宽高比
        this.camera.left = -this.s * this.k;
        this.camera.right = this.s * this.k;
        this.camera.top = this.s;
        this.camera.bottom = -this.s;
        // 渲染器执行render方法的时候会读取相机对象的投影矩阵属性projectionMatrix
        // 但是不会每渲染一帧，就通过相机的属性计算投影矩阵(节约计算资源)
        // 如果相机的一些属性发生了变化，需要执行updateProjectionMatrix ()方法更新相机的投影矩阵
        this.camera.updateProjectionMatrix ();
      },
      // 添加鼠标控制
      orbitControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);//创建控件对象
        this.renderer.domElement.removeAttribute("tabindex");
        this.controls.addEventListener('change', this.render);
      },
      // 加载stl模型
      loadSTL(url) {
        // 创建网格模型
        this.loader.load(url, (geometry) => {
          let material = new Three.MeshLambertMaterial({
            color: 0x0095ff,
            side: Three.DoubleSide,
          });
          let mesh = new Three.Mesh(geometry, material);
          mesh.geometry.center(); // 居中
          this.scene.add(mesh);
          this.render();
        });
      },
      drawGrid() {
        let geometry = new Three.Geometry();
        geometry.vertices.push(new Three.Vector3(-500, -510, 0));
        geometry.vertices.push(new Three.Vector3(500, -510, 0));
        for (let i = 0; i <= 20; i++) {
          //画横线
          let line1 = new Three.Line(geometry, new Three.LineBasicMaterial({ color: 0xffffff, opacity: 0.2 }));
          line1.position.z = (i * 50) - 500;
          this.scene.add(line1);

          let line2 = new Three.Line(geometry, new Three.LineBasicMaterial({ color: 0xffffff, opacity: 0.2 }));
          line2.position.x = (i * 50) - 500;
          line2.rotation.y = 90 * Math.PI / 180;   //转90度
          this.scene.add(line2);
        }
      },
      initialScene() {
        this.point.position.set(200, 100, 300); //点光源位置
        this.scene.add(this.point); // 点光源添加到场景中
        this.scene.add(this.ambient); // 环境光添加到场景中
        // 相机设置
        this.k = this.width / this.height; //窗口宽高比
        this.s = 800;
        this.camera = new Three.OrthographicCamera(-this.s * this.k, this.s * this.k, this.s, -this.s, -500, 2000);
        this.camera.position.set(400, 400, 200); //设置相机位置
        this.camera.lookAt(this.scene.position); //设置相机方向(指向的场景对象)
        this.renderer.setSize(this.width, this.height);//设置渲染区域尺寸
        this.renderer.setClearColor(0x333333, 1); //设置背景颜色
        const fatherElement = document.getElementById('webgl');
        fatherElement.appendChild(this.renderer.domElement); //Home元素中插入canvas对象
        this.drawGrid();
        this.loadSTL('/src/model/model1.stl'); // 加载stl模型
        this.orbitControls(); // 添加鼠标控制
      },
    }
  }
</script>

