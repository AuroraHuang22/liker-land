<template>
  <TxModal
    :is-open="isOpen"
    :has-close-button="isShowCloseButton"
    :header-text="headerText"
    preset="collect"
    @close="handleClose"
  >
    <template #header-prepend>
      <IconPrice />
    </template>

    <template v-if="!uiTxNFTStatus || ['insufficient', 'failed'].includes(uiTxNFTStatus)" #top>
      <NFTPageOwning
        v-if="hasConnectedWallet"
        class="mb-[10px] phone:mt-0"
        :collected-count="userCollectedCount"
      />
    </template>

    <template
      v-if="isCompleted"
      #message
    >
      <client-only>
        <model-viewer
          v-if="nftModelURL"
          :alt="nftClassCollectionName"
          :src="nftModelURL"
          class="mt-[12px] w-full h-[300px] max-h-[30vh]"
          auto-rotate
          auto-rotate-delay="500"
          xr-environment
          shadow-intensity="1"
          camera-controls
          camera-orbit="315deg 60deg 100m"
          @click.once="onClickModelViewer"
        />
      </client-only>
      <Label class="text-medium-gray mt-[12px] flex-nowrap" preset="h6" align="center">
        <i18n
          :path="
            hasConnectedWallet
              ? 'tx_modal_status_complete_text_collect'
              : 'tx_modal_status_complete_text_collect_without_wallet'"
        >
          <NuxtLink
            class="font-[600] underline"
            place="portfolio"
            :to="localeLocation({
              name: 'id',
              params: { id: getAddress }
            })"
          >
            {{ $t('tx_modal_status_complete_text_collect_portfolio') }}
          </NuxtLink>
        </i18n>
      </Label>
      <div
        v-if="!isFollowPromptStateDefault"
        class="flex justify-center items-center mt-[16px] px-[12px] rounded-[48px] border-[1px] border-medium-gray"
      >
        <NFTMessageIdentity
          type="creator"
          class="flex-shrink-0 !px-0"
          :wallet-address="iscnOwner"
          :avatar-size="40"
        />
        <div class="ml-[24px]">
          <ProgressIndicator v-if="isFollowPromptUpdating" preset="thin" />
          <div v-else class="relative flex group w-[138px]" @click="handleClickFollow">
            <div
              :class="[
                ...getDefaultClass,
                isFollowPromptStateAuto
                  ? '!bg-like-cyan-light text-like-green'
                  : '!bg-shade-gray text-dark-gray',
              ]"
            >
              <Label align="center" :text="followPromptButtonText">
                <template v-if="isFollowPromptStateAuto" #prepend>
                  <IconCheck />
                </template>
              </Label>
            </div>
            <div
              :class="[
                ...getDefaultClass,
                'group-hover:opacity-[100]',
                'group-active:!bg-medium-gray',
                'opacity-0',
                'transition-all',
                'absolute',
                'inset-0',
                isFollowPromptStateAuto
                  ? '!bg-shade-gray text-dark-gray'
                  : '!bg-like-cyan-light text-like-green',
              ]"
            >
              <Label align="center" :text="followPromptButtonHoverText" />
            </div>
          </div>
        </div>

      </div>
    </template>

    <template v-if="isCompleted && !hasConnectedWallet && paymentId">
      <Label
        class="text-like-green mt-[24px]"
        preset="h5"
        align="center"
        :text="$t('tx_modal_status_complete_reference_code')"
      />
      <Label
        class="text-like-green mt-[8px] p-[12px] border-[2px] border-shade-gray rounded-[8px]"
        preset="p5"
        align="center"
        :text="paymentId"
      />
    </template>

    <!-- Button for complete of collecting -->
    <template
      v-if="isCompleted && hasConnectedWallet"
      #button
    >
      <ButtonV2
        preset="outline"
        :text="$t('nft_details_page_button_view_details')"
        class="mr-[12px]"
        @click="goToNFTDetails"
      >
        <template #prepend>
          <IconEye class="w-[20px]" />
        </template>
      </ButtonV2>
    </template>

    <template v-if="!uiTxNFTStatus">
      <section
        v-if="paymentMethod === undefined"
        class="flex flex-col items-start mb-[28px]"
      >
        <Separator class="h-[2px] bg-shade-gray self-center phone:hidden" />
        <Label
          preset="p6"
          align="left"
          class="text-medium-gray mt-[12px] mb-[6px]"
          :text="$t('nft_collect_modal_leave_message')"
        />
        <div class="flex w-full py-[10px] px-[16px] gap-[12px] bg-shade-gray rounded-[12px]">
          <IconMessage class="text-dark-gray" />
          <input
            id="name"
            ref="input"
            type="input"
            class="w-full bg-transparent border-0 focus-visible:outline-none"
            :placeholder="$t('nft_collect_modal_leave_message_to_name', { name: creatorDisplayName })"
            name="name"
            @input="onInputCollectMessage"
          >
        </div>
      </section>

      <section v-if="paymentMethod === undefined">
        <!-- <Label
          class="text-like-green"
          preset="h5"
          align="center"
          :text="$t('nft_collect_modal_subtitle_select_collect_method')"
        /> -->
        <ul class="mt-[16px] flex flex-col gap-[16px] mx-auto max-w-[320px] w-full">
          <!-- <li>
            <EventModalCollectMethodButton
              :class="{ 'border-like-cyan': canPayByFiat && !hasConnectedWallet }"
              :title="$t('nft_collect_modal_method_stripe')"
              type="stripe"
              :is-disabled="!canPayByFiat"
              :price="formattedNFTPriceInUSD"
              @click="handleSelectPaymentMethod"
            />
          </li> -->
          <li>
            <EventModalCollectMethodButton
              :class="{ 'rounded-b-[0]': hasConnectedWallet }"
              :title="$t('nft_collect_modal_method_like')"
              type="crypto"
              :is-disabled="isDisabledPayByLIKE"
              :price="formattedNFTPriceInLIKE"
              @click="handleSelectPaymentMethod"
            />
            <div
              v-if="hasConnectedWallet"
              :class="[
                'flex',
                'justify-end',
                'items-center',
                isInsufficientLIKE || !canPayByLIKE
                  ? 'bg-light-gray border-shade-gray'
                  : 'bg-like-cyan-pale border-medium-gray',
                'border-2',
                'border-t-0',
                'rounded-b-[8px]',
                'px-[16px]',
                'py-[4px]',
                isInsufficientLIKE ? 'text-danger' : 'text-like-green',
                'text-[12px]',
                'text-right',
                'font-[600]',
              ]"
            >
              <i18n path="nft_collect_modal_method_like_available_amount">
                <span
                  v-if="!walletLIKEBalanceFetchPromise"
                  class="font-[400]"
                  place="amount"
                >
                  {{ walletLIKEBalance | formatNumberWithLIKE }}
                </span>
              </i18n>
              <ProgressIndicator
                v-if="walletLIKEBalanceFetchPromise"
                class="ml-[8px] w-[48px] h-[16px]"
              />
            </div>
          </li>
        </ul>
      </section>
      <section v-else>
        <ProgressIndicator class="mx-auto" />
      </section>
    </template>
  </TxModal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import { logTrackerEvent } from '~/util/EventLogger';
import { formatNumberWithLIKE } from '~/util/ui';

import clipboardMixin from '~/mixins/clipboard';
import nftMixin from '~/mixins/nft';

const FOLLOW_PROMPT_STATE = {
  DEFAULT: 'default', // No need to show any follow UI.
  UNFOLLOW: 'unfollow', // Show a switch button to toggle follow status.
  AUTO: 'auto', // Show auto-followed UI.
};

export default {
  filters: {
    formatNumberWithLIKE,
  },
  mixins: [clipboardMixin, nftMixin],
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  head() {
    return {
      link: [
        {
          rel: 'modulepreload',
          href:
            'https://unpkg.com/@google/model-viewer@3.0.2/dist/model-viewer.min.js',
          as: 'script',
        },
        {
          rel: 'prefetch',
          crossorigin: 'anonymous',
          href: this.nftModelURL,
        },
      ],
      script: [
        {
          type: 'module',
          src:
            'https://unpkg.com/@google/model-viewer@3.0.2/dist/model-viewer.min.js',
          asyc: 'true',
        },
      ],
    };
  },
  data() {
    return {
      paymentMethod: undefined,
      justCollectedNFTId: undefined,
      shouldShowMessageInput: false,
      memo: '',
      followPromptState: FOLLOW_PROMPT_STATE.DEFAULT,
      isFollowPromptUpdating: false,
    };
  },
  computed: {
    ...mapGetters([
      'getAddress',
      'walletFollowees',
      'walletIsLoggingIn',
      'walletInteractedCreators',
    ]),
    developerMode() {
      return !!this.$route.query.debug;
    },
    classId() {
      // Alias for NFT mixin
      return this.uiTxTargetClassId;
    },
    headerText() {
      return this.isShowCloseButton
        ? this.$t('nft_collect_modal_title_collect')
        : this.$t('nft_collect_modal_title_collecting');
    },
    isShowCloseButton() {
      return (
        this.paymentMethod === undefined || this.uiTxNFTStatus === 'completed'
      );
    },
    isCompleted() {
      return this.uiTxNFTStatus === 'completed';
    },
    isInsufficientLIKE() {
      return this.walletLIKEBalance < this.NFTPrice;
    },
    canPayByFiat() {
      return this.formattedNFTPriceInUSD && this.formattedNFTPriceInUSD !== '-';
    },
    canPayByLIKE() {
      if (this.developerMode) return true;
      const notSupportedPlatforms = ['keplr-mobile'];
      return !notSupportedPlatforms.includes(this.walletMethodType);
    },
    isDisabledPayByLIKE() {
      return (
        this.hasConnectedWallet &&
        (this.isInsufficientLIKE || !this.canPayByLIKE)
      );
    },
    paymentId() {
      return this.$route.query.payment_id;
    },
    creatorDisplayName() {
      return (
        this.getUserInfoByAddress(this.iscnOwner)?.displayName || 'creator'
      );
    },
    followPromptButtonText() {
      if (this.isFollowPromptUpdating) {
        return this.$t('nft_details_page_label_loading');
      }
      if (this.isFollowPromptStateAuto) {
        return this.$t('settings_following');
      }
      return this.$t('settings_follow_follow');
    },
    followPromptButtonHoverText() {
      if (this.isFollowPromptStateAuto) {
        return this.$t('settings_follow_unfollow');
      }
      return this.$t('settings_follow_follow');
    },
    isFollowPromptStateDefault() {
      return this.followPromptState === FOLLOW_PROMPT_STATE.DEFAULT;
    },
    isFollowPromptStateAuto() {
      return this.followPromptState === FOLLOW_PROMPT_STATE.AUTO;
    },
    getDefaultClass() {
      return [
        'flex',
        'gap-[16px]',
        'box-border',
        'overflow-hidden',
        'justify-center',
        'items-center',
        'transition',
        'duration-200',
        'h-40px',
        'w-full',
        'font-600',
        'px-[16px]',
        'py-[8px]',
        'rounded-[20px]',
        'cursor-pointer',
      ];
    },
  },
  watch: {
    isOpen(isOpen) {
      if (isOpen && this.classId) {
        // Reset state when open modal
        this.resetState();
      }
    },
    classId(nftClassId) {
      if (nftClassId) {
        // Reset state when NFT Class change
        this.resetState();
      }
    },
    getAddress() {
      if (this.hasConnectedWallet) {
        // Fetch user collected count when wallet change
        this.userCollectedCount = undefined;
        this.fetchUserCollectedCount();
      }
    },
    uiTxNFTStatus() {
      if (this.uiTxNFTStatus === 'processing' && this.walletHasLoggedIn) {
        const creator = this.getNFTClassMetadataById(this.classId)?.iscn_owner;
        if (
          this.walletFollowees?.includes(creator) ||
          creator === this.getAddress
        ) {
          this.followPromptState = FOLLOW_PROMPT_STATE.DEFAULT;
        } else if (this.walletInteractedCreators?.includes(creator)) {
          this.followPromptState = FOLLOW_PROMPT_STATE.UNFOLLOW;
        } else {
          this.followPromptState = FOLLOW_PROMPT_STATE.AUTO;
          this.walletFollowCreator(creator);
        }
      }
    },
  },
  mounted() {
    if (this.classId) {
      this.resetState();
    }
  },
  methods: {
    ...mapActions([
      'uiCloseTxModal',
      'walletFollowCreator',
      'walletAddInteractedCreator',
      'walletUnfollowCreator',
    ]),
    resetState() {
      this.paymentMethod = undefined;
      this.justCollectedNFTId = undefined;
      this.memo = '';

      // Mixin
      this.nftPriceInUSD = undefined;
      this.nftPriceInUSDisListingInfo = undefined;
      this.userCollectedCount = undefined;
      this.fetchNFTPrices(this.classId);
      this.fetchUserCollectedCount();
    },
    async handleSelectPaymentMethod(method) {
      this.paymentMethod = method;
      if (this.memo) {
        logTrackerEvent(this, 'NFT', 'NFTCollectorMessage', this.classId, 1);
      }
      try {
        switch (method) {
          case 'crypto': {
            if (!this.getAddress) {
              const isConnected = await this.connectWallet({
                shouldSkipLogin: true,
              });
              if (!isConnected) return;
            }
            logTrackerEvent(
              this,
              'NFT',
              'NFTCollectPaymentMethod(LIKE)',
              this.classId,
              1
            );
            const result = await this.collectNFTWithLIKE({ memo: this.memo });
            if (result) {
              this.justCollectedNFTId = result.nftId;
            }
            break;
          }
          case 'stripe':
            logTrackerEvent(
              this,
              'NFT',
              'NFTCollectPaymentMethod(Stripe)',
              this.classId,
              1
            );
            await this.collectNFTWithStripe({ memo: this.memo });
            break;
          default:
            break;
        }
      } finally {
        this.paymentMethod = undefined;
      }
    },
    goToNFTDetails() {
      this.$router.push(
        this.localeLocation({
          name: 'nft-class-classId-nftId',
          params: { classId: this.classId, nftId: this.justCollectedNFTId },
        })
      );
      this.uiCloseTxModal();
    },
    onClickModelViewer() {
      logTrackerEvent(
        this,
        'NFT',
        'nft_collect_modal_click_model_viewer',
        this.classId,
        1
      );
    },
    handleClose() {
      this.$emit('close');
      this.shouldShowMessageInput = false;
    },
    handleShowInput() {
      this.shouldShowMessageInput = true;
    },
    onInputCollectMessage(e) {
      this.memo = e.target.value;
    },
    async handleClickFollow() {
      try {
        this.isFollowPromptUpdating = true;
        switch (this.followPromptState) {
          case FOLLOW_PROMPT_STATE.AUTO:
            this.followPromptState = FOLLOW_PROMPT_STATE.UNFOLLOW;
            await [this.walletUnfollowCreator(this.iscnOwner)];
            logTrackerEvent(
              this,
              'NFT',
              'NFTAutoFollow',
              FOLLOW_PROMPT_STATE.UNFOLLOW,
              1
            );
            break;
          case FOLLOW_PROMPT_STATE.UNFOLLOW:
          default:
            this.followPromptState = FOLLOW_PROMPT_STATE.AUTO;
            await this.walletFollowCreator(this.iscnOwner);
            logTrackerEvent(
              this,
              'NFT',
              'NFTAutoFollow',
              FOLLOW_PROMPT_STATE.AUTO,
              1
            );
            break;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        this.isFollowPromptUpdating = false;
      }
    },
  },
};
</script>
