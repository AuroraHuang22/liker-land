<template>
  <div
    class="relative bg-gray-9b"
    :style="rootStyle"
  >
    <video
      v-if="isShowVideo"
      autoplay
      muted
      loop
      playsinline
      v-bind="imgProps"
      :poster="resizedSrc"
      :src="videoSrc"
      @play="handleMediaLoad"
      @error="handleVideoError"
    />
    <img
      v-else-if="isShowImage"
      v-bind="imgProps"
      :src="resizedSrc"
      @load="handleMediaLoad"
      @error="handleImageError"
    >
    <img
      v-if="!isShowVideo && (!isShowImage || !isLoaded)"
      v-bind="imgPropsForPlaceholder"
      src="~/assets/images/nft/primitive-nft.jpg"
    >
  </div>
</template>

<script>
import { getLikeCoResizedImageUrl } from '~/util/ui';

export default {
  name: 'NFTCover',
  props: {
    src: {
      type: String,
      default: '',
    },
    videoSrc: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 720,
    },
    bgColor: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isError: false,
      isLoaded: false,
      isVideoError: false,
    };
  },
  computed: {
    rootStyle() {
      return {
        backgroundColor: this.imgBgColor,
      };
    },
    imgProps() {
      const { imgPropsForPlaceholder: props, isLoaded } = this;
      return {
        ...props,
        class: [
          ...props.class,
          {
            'pointer-events-none': !isLoaded,
            'absolute inset-x-0 top-0 opacity-0':
              !isLoaded && !this.isShowVideo,
          },
        ],
      };
    },
    imgPropsForPlaceholder() {
      return {
        class: [
          'object-contain w-full',
          {
            'animate-pulse': !this.isLoaded,
          },
        ],
        loading: 'lazy',
        ...this.$attrs,
      };
    },
    resizedSrc() {
      return getLikeCoResizedImageUrl(this.src, this.size);
    },
    isShowVideo() {
      return this.videoSrc && !this.isVideoError && !this.isError;
    },
    isShowImage() {
      return this.src && !this.isError;
    },
  },
  watch: {
    src() {
      this.isError = false;
      this.isLoaded = false;
    },
  },
  methods: {
    handleMediaLoad(e) {
      this.isLoaded = true;
      this.emitLoadEvent(e);
    },
    handleVideoError() {
      this.isVideoError = true;
    },
    handleImageError(e) {
      this.isError = true;
      this.isLoaded = true;
      this.emitLoadEvent(e);
    },
    emitLoadEvent(e) {
      this.$nextTick(() => {
        this.$emit('load', e);
      });
    },
  },
};
</script>
