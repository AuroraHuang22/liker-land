import { mapGetters } from 'vuex';

import {
  CROSS_SELL_PRODUCT_PROBABILITY,
  CROSS_SELL_PRODUCT_IDS_MAP,
  DISABLED_CROSS_SELL_POPUP_LIST,
  IS_TESTNET,
} from '~/constant';

export default {
  data() {
    return {
      isCrossSellDialogOpen: false,
      crossSellProductIndex: 0,
      isEnableCrossSell: IS_TESTNET
        ? true
        : Math.random() < CROSS_SELL_PRODUCT_PROBABILITY,
    };
  },
  computed: {
    ...mapGetters(['getShoppingCartBookProductQuantity']),
    crossSellCollectionId() {
      return this.crossSellProductId?.startsWith('col_')
        ? this.crossSellProductId
        : undefined;
    },
    crossSellClassId() {
      return this.crossSellProductId?.startsWith('likenft')
        ? this.crossSellProductId
        : undefined;
    },
    crossSellProductIds() {
      return (
        CROSS_SELL_PRODUCT_IDS_MAP[this.collectionId || this.classId] || []
      );
    },
    crossSellProductId() {
      return this.crossSellProductIds?.length
        ? this.crossSellProductIds[this.crossSellProductIndex]
        : undefined;
    },
    hasCrossSell() {
      return (
        !!this.crossSellProductId &&
        !this.getShoppingCartBookProductQuantity(this.crossSellProductId)
      );
    },
    isCrossSellDisabled() {
      return [this.classId, this.collectionId].some(id =>
        DISABLED_CROSS_SELL_POPUP_LIST.includes(id)
      );
    },
    shouldCrossSell() {
      return (
        this.isEnableCrossSell && this.hasCrossSell && !this.isCrossSellDisabled
      );
    },
  },
  watch: {
    isCrossSellDialogOpen: {
      handler(open) {
        if (open) {
          this.crossSellProductIndex = Math.floor(
            Math.random() * this.crossSellProductIds.length
          );
        }
      },
      immediate: true,
    },
  },
  methods: {
    closeCrossSellDialog() {
      this.isCrossSellDialogOpen = false;
    },
    openCrossSellDialog() {
      this.isCrossSellDialogOpen = true;
    },
  },
};
