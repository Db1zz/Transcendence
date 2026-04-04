package com.anteiku.backend.serviceTests;

import com.anteiku.backend.entity.ChannelEntity;
import com.anteiku.backend.entity.ChannelType;
import com.anteiku.backend.exception.ResourceNotFoundException;
import com.anteiku.backend.model.CreateChannelDto;
import com.anteiku.backend.model.CreateChannelResponseDto;
import com.anteiku.backend.repository.ChannelRepository;
import com.anteiku.backend.service.ChannelService;
import com.anteiku.backend.service.OrganizationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.nio.channels.Channel;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChannelServiceTests {
    @Mock
    private ChannelRepository channelRepository;
    @Mock
    private OrganizationService organizationService;

    @InjectMocks
    private ChannelService channelService;

    @Test
    void createChannelSuccessTest() {
        CreateChannelDto createChannelDto = new CreateChannelDto();
        createChannelDto.setName("test");
        createChannelDto.setChannelType(CreateChannelDto.ChannelTypeEnum.TEXT);

        CreateChannelResponseDto res = channelService.createChannel(createChannelDto);

        ArgumentCaptor<ChannelEntity> captor = ArgumentCaptor.forClass(ChannelEntity.class);
        verify(channelRepository, times(1)).save(captor.capture());
        ChannelEntity channelEntity = captor.getValue();

        assertEquals("test", channelEntity.getName());
        assertEquals(ChannelType.TEXT, channelEntity.getType());
        assertNotNull(channelEntity.getCreatedAt());

        assertNotNull(res);
        assertEquals("test", res.getName());
        assertEquals(CreateChannelResponseDto.ChannelTypeEnum.TEXT, res.getChannelType());
    }

    @Test
    void createChannelInvalidChannelTypeTest() {
        CreateChannelDto createChannelDto = mock(CreateChannelDto.class);
        createChannelDto.setName("test");
        createChannelDto.setChannelType(null);

        assertThrows(NullPointerException.class, () -> channelService.createChannel(createChannelDto));

        verify(channelRepository, never()).save(any());
    }

    @Test
    void deleteChannelSuccessTest() {
        UUID channelId = UUID.randomUUID();
        ChannelEntity channelEntity = new ChannelEntity();
        channelEntity.setId(channelId);
        channelEntity.setName("test");
        channelEntity.setType(ChannelType.TEXT);

        when(channelRepository.findById(channelId)).thenReturn(Optional.of(channelEntity));

        channelService.deleteChannel(channelId);

        verify(channelRepository, times(1)).delete(channelEntity);
    }

    @Test
    void deleteChannelNotFoundTest() {
        UUID randomId = UUID.randomUUID();

        when(channelRepository.findById(randomId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> channelService.deleteChannel(randomId));

        verify(channelRepository, never()).delete(any());
    }
}
