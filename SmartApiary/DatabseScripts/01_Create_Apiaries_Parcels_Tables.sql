IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SmartApiary')
BEGIN
    CREATE DATABASE SmartApiary;
END
GO

USE SmartApiary;
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Apiaries]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Apiaries] (
        [Id] UNIQUEIDENTIFIER NOT NULL,
        [Name] NVARCHAR(256) NOT NULL,
        [Location] GEOGRAPHY NOT NULL,
        [Description] NVARCHAR(1000) NOT NULL,
        [ImageUrl] NVARCHAR(1000) NOT NULL,
        [ThumbnailUrl] NVARCHAR(1000) NOT NULL,
        [BeekeeperId] UNIQUEIDENTIFIER NOT NULL,
        CONSTRAINT [PK_Apiaries] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Parcels]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Parcels] (
        [Id] UNIQUEIDENTIFIER NOT NULL,
        [Name] NVARCHAR(256) NOT NULL,
        [Location] GEOGRAPHY NOT NULL,
        [FarmerId] UNIQUEIDENTIFIER NOT NULL,
        CONSTRAINT [PK_Parcels] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO